import { Injectable } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';

@Injectable()
export class MatchCancelService {
  constructor(
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
  ) {}

  cancelMatchRequest(_matchData: any) {
    // Perform match cancellation
  }
}
