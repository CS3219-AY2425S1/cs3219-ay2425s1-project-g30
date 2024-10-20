import { Injectable } from '@nestjs/common';
import { MatchSupabase } from './db/match.supabase';

@Injectable()
export class MatchService {
  constructor(private readonly matchSupabase: MatchSupabase) {}

  async getMatchById(matchId: string) {
    return await this.matchSupabase.getMatch(matchId);
  }

  async getMatchesByUserId(userId: string) {
    return await this.matchSupabase.getMatchesByUserId(userId);
  }
}
