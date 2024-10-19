import { Injectable, Logger } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';
import {
  MatchCriteriaDto,
  MatchDataDto,
  MatchRequestMsgDto,
} from '@repo/dtos/match';
import { MATCH_TIMEOUT } from 'src/constants/queue';

@Injectable()
export class MatchEngineService {
  private readonly logger = new Logger(MatchEngineService.name);
  constructor(
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
    private readonly matchGateway: MatchingGateway,
  ) {}

  /**
   * Generates a match for the user based on the match request.
   * If a match is found, the match data is saved to the database.
   * If no match is found, the match request is added to the matching queue with an expiry time.
   * @param matchRequest MQ message containing user id, array of categories and complexity to match
   * @returns
   */

  async generateMatch(matchRequest: MatchRequestMsgDto) {
    const { userId, category, complexity } = matchRequest;

    const matchedData = await this.matchRedis.findPotentialMatch({
      category,
      complexity,
    });

    if (matchedData) {
      this.logger.log(
        `Match found for user ${userId} and ${matchedData.userId}`,
      );

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

      this.logger.debug(
        `Saving match data to DB: ${JSON.stringify(matchData)}`,
      );

      // Send match found message containg matchId to both users
      this.matchGateway.sendMatchFound({
        userId: userId,
        message: matchedData.matchId,
      });

      this.matchGateway.sendMatchFound({
        userId: matchedData.userId,
        message: matchedData.matchId,
      });
      await this.matchSupabase.saveMatch(matchData);
    } else {
      this.logger.log(
        `No match found for user ${userId}, adding to matching queue`,
      );
      // No match found, add the match to redis
      const matchid = await this.matchRedis.addMatchRequest(matchRequest);
      if (!matchid) {
        throw new Error('Failed to add match request');
      }
      await this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(
        matchid,
        MATCH_TIMEOUT,
      );
    }
  }
}
