import { Injectable } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';

@Injectable()
export class MatchEngineService {
  constructor(
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
  ) {}

  async generateMatch(matchRequest: any) {
    // Performs some sort of redis checking
    // Add to supabase if match found
    // If no match found produce match expiry
    this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(
      matchRequest,
      30000,
    );
  }
}
