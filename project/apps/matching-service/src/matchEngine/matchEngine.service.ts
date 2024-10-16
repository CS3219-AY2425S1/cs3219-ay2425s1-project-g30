import { Injectable } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';
import { MatchDataDto, MatchRequestDto, MatchRequestMsgDto } from '@repo/dtos/match';

@Injectable()
export class MatchEngineService {
  constructor(
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
    private readonly matchGateway: MatchingGateway,
  ) {}

  async generateMatch(matchRequest: MatchRequestMsgDto) {
    const {userId, category, complexity} = matchRequest;

    const matchedUser = await this.matchRedis.findPotentialMatch({category, complexity});

    if (matchedUser) {
      // TODO: Get a random question from the question service then create match
      const matchData: MatchDataDto = {
        user1_id: userId,
        user2_id: matchedUser.userId,
        complexity: complexity,
        category: category,
        match_id: matchedUser.matchId,
        question_id: "1234"
      };
      this.matchGateway.sendMatchFound({
        userId: matchedUser.userId,
        message: 'success',
      });
      await this.matchSupabase.saveMatch(matchData);
    } else {
      // No match found, add the match to redis
      const matchid = await this.matchRedis.addMatchRequest(matchRequest);
      if (!matchid) {
        throw new Error("Failed to add match request");
      }
      await this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(matchid, 30000);
    }
  }
}
