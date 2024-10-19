import { Injectable } from '@nestjs/common';
import { MatchSupabase } from './db/match.supabase';

@Injectable()
export class MatchService {
  constructor(private readonly matchSupabase: MatchSupabase) {}

  async getMatchById(matchId: string) {
    this.matchSupabase.getMatchesByUserId(matchId);
  }

  async getMatchesByUserId(userId: string) {
    this.matchSupabase.getMatchesByUserId(userId);
  }
}
