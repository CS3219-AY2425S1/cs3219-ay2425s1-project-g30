import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';
import { MatchDataDto, MatchRequestDto } from '@repo/dtos/match';
import { CollabRequestDto } from '@repo/dtos/collab';
import { MATCH_TIMEOUT } from 'src/constants/queue';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatchEngineService {
  private readonly logger = new Logger(MatchEngineService.name);
  constructor(
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
    private readonly matchGateway: MatchingGateway,
    @Inject('COLLABORATION_SERVICE')
    private readonly collabServiceClient: ClientProxy,
  ) {}

  /**
   * Generates a match for the user based on the match request.
   * If a match is found, the match data is saved to the database.
   * If no match is found, the match request is added to the matching queue with an expiry time.
   * @param matchRequest MQ message containing user id, array of categories and complexity to match
   * @returns
   */

  async generateMatch(matchRequest: MatchRequestDto) {
    const { userId, category, complexity } = matchRequest;

    try {
      const matchedData = await this.findPotentialMatch(
        userId,
        category,
        complexity,
      );

      if (!matchedData) {
        this.logger.log(
          `No immediate match found for user ${userId}, adding to matching queue`,
        );
        // No match found, add the match to redis
        const match_req_id =
          await this.matchRedis.addMatchRequest(matchRequest);
        if (!match_req_id) {
          throw new Error('Failed to add match request');
        }
        await this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(
          match_req_id,
          MATCH_TIMEOUT,
        );
        return;
      }

      this.logger.log(
        `Match found for user ${userId} and ${matchedData.userId}`,
      );

      // Find the overlapping categories between both users
      const overlappingCategories = category.filter((value) =>
        matchedData.category.includes(value),
      );

      const matchData: MatchDataDto = {
        user1_id: userId,
        user2_id: matchedData.userId,
        complexity: complexity,
        category: overlappingCategories,
        id: matchedData.matchId,
      };

      this.logger.debug(
        `Saving match data to DB: ${JSON.stringify(matchData)}`,
      );

      // Obtain the Collab ID from Collaboration-service
      const collabId = await this.createCollab({
        user1_id: matchData.user1_id,
        user2_id: matchData.user2_id,
        complexity: matchData.complexity,
        category: matchData.category,
        match_id: matchData.id,
      });

      // Send match found message containg collabId to both users
      this.matchGateway.sendMatchFound({
        userId: userId,
        message: collabId,
      });

      this.matchGateway.sendMatchFound({
        userId: matchedData.userId,
        message: collabId,
      });
      await this.matchSupabase.saveMatch(matchData);
    } catch (error) {
      this.logger.error(`Error generating match: ${error.message}`);
      this.matchGateway.sendMatchInvalid({ userId, message: error.message });
    }
  }

  async createCollab(collabReqData: CollabRequestDto) {
    const collabId: string = await firstValueFrom(
      this.collabServiceClient.send({ cmd: 'create_collab' }, collabReqData),
    );
    return collabId;
  }

  /**
   * Finds a potential match in redis based on one of the selected categories and complexity
   * 1. Fetches all the matching match_req_Ids from the sorted set for each category
   * 2. Checks if the match_req_Id is in the cancelled list
   * 3. Sort the list of potential matches by earliest timestamp and choose the oldest request
   * 4. Removes the match request from redis
   * @param criteria Match requester's selected categories and complexity
   * @returns The userId and matchId of the potential match if found, otherwise null
   */

  async findPotentialMatch(
    userId: string,
    categories: CATEGORY[],
    complexity: COMPLEXITY,
  ): Promise<{ userId: string; category: CATEGORY[]; matchId: string } | null> {
    const responses = await this.matchRedis.addMatchCategoryRequest(
      categories,
      complexity,
    );
    if (!responses) return null;

    const fetchPromises = responses.map(async ([err, res], index) => {
      if (err) {
        this.logger.error(
          `Error fetching match_req_Id(s) from category ${categories[index]}:`,
          err,
        );
        return null;
      }

      for (const match_req_Id of res as string[]) {
        if (!match_req_Id) continue;

        const matchRequest =
          await this.matchRedis.getMatchRequest(match_req_Id);
        if (!matchRequest || matchRequest.userId === userId) continue;

        // Also need to check if the match_req_Id is in the cancelled list
        const isCancelled =
          await this.matchRedis.isMatchRequestCancelled(match_req_Id);
        if (isCancelled) {
          this.logger.debug(
            `Match request ${match_req_Id} is cancelled, removing match request and skipping`,
          );
          // Remove the cancelled match request from the sorted set
          await this.matchRedis.removeMatchRequest(match_req_Id);
          continue;
        }

        // Check if the partner has a matching socket connection
        const partnerSocketId = await this.matchRedis.getSocketByUserId(
          matchRequest.userId,
        );
        if (!partnerSocketId || partnerSocketId !== matchRequest.socketId) {
          this.logger.debug(
            `Partner ${matchRequest.userId} does not have a socket connection, skipping`,
          );
          // Remove the partner match request from the sorted set
          await this.matchRedis.removeMatchRequest(match_req_Id);
          continue;
        }

        if (matchRequest) {
          // Check if the match requester is alive
          const validSocket =
            await this.matchGateway.isSocketAlive(partnerSocketId);
          if (!validSocket) {
            this.logger.warn(
              `Peer web socket ${matchRequest.userId} no longer connected: socketId: ${partnerSocketId}, skipping`,
            );
            await this.matchRedis.removeMatchRequest(match_req_Id);
            continue;
          }
          // Partner match request found
          this.logger.debug(`Partner match request found: ${match_req_Id}`);

          // Remove the partner match request from the sorted set
          await this.matchRedis.removeMatchRequest(match_req_Id);
          return matchRequest;
        }
      }

      // No match found for this category
      return null;
    });

    const matchResults = await Promise.all(fetchPromises);

    const validResults = matchResults.filter((req) => req !== null);

    if (validResults.length === 0) return null; // No matches found

    // sort by earliest first
    validResults.sort((a, b) => a.timestamp - b.timestamp);
    const oldestMatch = validResults[0];

    const match_id = uuidv4();

    await this.matchRedis.removeMatchRequest(oldestMatch.match_req_id);

    return {
      userId: oldestMatch.userId,
      category: oldestMatch.category,
      matchId: match_id,
    };
  }
}
