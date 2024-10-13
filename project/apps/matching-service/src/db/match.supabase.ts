import { Injectable } from '@nestjs/common';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvService } from 'src/env/env.service';
import { matchDataSchema, MatchDataDto } from '@repo/dtos/match';

@Injectable()
export class MatchSupabase {
  private supabase: SupabaseClient;

  private readonly MATCHES_TABLE = 'matches';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');
    console.log(supabaseKey);
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveMatch(matchData: MatchDataDto): Promise<any> {
    const parsedMatchData = matchDataSchema.parse(matchData);
    const { data, error } = await this.supabase
      .from(this.MATCHES_TABLE)
      .insert(parsedMatchData);

    if (error) {
      throw new Error(`Error inserting match: ${error.message}`);
    }

    return data;
  }
}
