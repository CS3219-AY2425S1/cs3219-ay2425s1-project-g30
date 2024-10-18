import { Injectable } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';

@Injectable()
export class MatchEngineService {
  constructor(
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
    private readonly matchGateway: MatchingGateway,
  ) {}

  async generateMatch(matchRequest: any) {
    // Performs some sort of redis checking
    // Add to supabase if match found
    // If no match found produce match expiry

    // TODO: Replace with userId of user
    this.matchGateway.sendMatchFound({
      userId: '3821549f-001f-4fb9-beb8-8fb293747519',
      message: 'success',
    });

    this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(
      matchRequest,
      30000,
    );
  }
}
