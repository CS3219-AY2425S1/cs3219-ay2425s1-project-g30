import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';
import {
  MatchCriteriaDto,
  MatchDataDto,
  MatchRequestDto,
} from '@repo/dtos/match';
import { CollabCreateDto, CollabDto } from '@repo/dtos/collab';
import { MATCH_TIMEOUT } from 'src/constants/queue';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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

    const matchedData = await this.matchRedis.findPotentialMatch(
      userId,
      category,
      complexity,
    );

    if (!matchedData) {
      this.logger.log(
        `No immediate match found for user ${userId}, adding to matching queue`,
      );
      // No match found, add the match to redis
      const match_req_id = await this.matchRedis.addMatchRequest(matchRequest);
      if (!match_req_id) {
        throw new Error('Failed to add match request');
      }
      await this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(
        match_req_id,
        MATCH_TIMEOUT,
      );
      return;
    }

    this.logger.log(`Match found for user ${userId} and ${matchedData.userId}`);

    // Find the overlapping categories between both users
    const overlappingCategories = category.filter((value) =>
      matchedData.category.includes(value),
    );

    const filters: MatchCriteriaDto = {
      category: overlappingCategories,
      complexity: complexity,
    };

    const selectedQuestion =
      await this.matchSupabase.getRandomQuestion(filters);

    if (selectedQuestion === '') {
      this.logger.warn(
        `No suitable questions found for match ${matchedData.matchId}`,
      );
      this.matchGateway.sendMatchInvalid({
        userId: userId,
        message: 'No suitable questions found for match',
      });
      return;
    }
    const matchData: MatchDataDto = {
      user1_id: userId,
      user2_id: matchedData.userId,
      complexity: complexity,
      category: category,
      id: matchedData.matchId,
      question_id: selectedQuestion,
    };

    this.logger.debug(`Saving match data to DB: ${JSON.stringify(matchData)}`);

    // Obtain the Collab ID from Collaboration-service
    const collabData = await this.createCollab({
      user1_id: matchData.user1_id,
      user2_id: matchData.user2_id,
      match_id: matchData.id,
      question_id: matchData.question_id,
    });

    // Send match found message containg matchId to both users
    this.matchGateway.sendMatchFound({
      userId: userId,
      message: collabData.id,
    });

    this.matchGateway.sendMatchFound({
      userId: matchedData.userId,
      message: collabData.id,
    });
    await this.matchSupabase.saveMatch(matchData);
  }

  async createCollab(collabCreateData: CollabCreateDto) {
    const collabData: CollabDto = await firstValueFrom(
      this.collabServiceClient.send({ cmd: 'create_collab' }, collabCreateData),
    );
    return collabData;
  }
}
