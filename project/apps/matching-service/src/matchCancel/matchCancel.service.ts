import { Injectable } from '@nestjs/common';
import { MatchCancelDto } from '@repo/dtos/match';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';

@Injectable()
export class MatchCancelService {
  constructor(
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
  ) {}

  async cancelMatchRequest(matchCancel: MatchCancelDto) {
    this.matchRedis.addToCancelledMatchList(matchCancel.match_req_id);
  }
}
