import { Injectable } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';
import { MatchDataDto, MatchRequestDto } from '@repo/dtos/match';

@Injectable()
export class MatchEngineService {
  constructor(
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
    private readonly matchGateway: MatchingGateway,
  ) {}

  async generateMatch(matchRequest: MatchRequestDto) {
    const {userId, criteria} = matchRequest;

    const potentialMatch = await this.matchRedis.findPotentialMatch(criteria);

    if (potentialMatch) {
      await this.matchRedis.removeMatchRequest(potentialMatch.userId);
      
      const matchData: MatchDataDto = {
        user1_id: userId,
        user2_id: potentialMatch.userId,
        complexity: criteria.complexity,
        category: criteria.category,
      };
      this.matchGateway.sendMatchFound({
        userId: potentialMatch.userId,
        message: 'success',
      });
      await this.matchSupabase.saveMatch(matchData);
    } else {
      // No match found, add the match to redis
      await this.matchRedis.addMatchRequest(userId, criteria);
      await this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(matchRequest, 30000);
    }
  }
}
