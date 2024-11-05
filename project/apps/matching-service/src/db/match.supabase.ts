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
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Saves a match to the database
   * @param {MatchDataDto} matchData The match data to save
   * @throws Will throw an error if the match data is invalid or the query fails
   */

  async saveMatch(matchData: MatchDataDto): Promise<void> {
    const parsedMatchData = matchDataSchema.parse(matchData);
    const { error } = await this.supabase
      .from(this.MATCHES_TABLE)
      .insert(parsedMatchData);

    if (error) {
      throw new Error(`Error inserting match: ${error.message}`);
    }
  }

  /**
   * Retrieves a match from the database
   * @param matchId The id of the match to retrieve
   * @returns The match data
   * @throws Will throw an error if the matchId is invalid or the query fails
   */

  async getMatch(matchId: string): Promise<MatchDataDto> {
    const { data, error } = await this.supabase
      .from(this.MATCHES_TABLE)
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) {
      throw new Error(`Error fetching match: ${error.message}`);
    }
    return data;
  }

  /**
   * Retrieves all match information by user id.
   * @param userId The id of the user to retrieve matches for.
   * @returns The match data(s).
   * @throws Will throw an error if the userId is invalid or the query fails.
   */
  async getMatchesByUserId(userId: string): Promise<MatchDataDto[]> {
    // Perform the query
    const { data, error } = await this.supabase
      .from(this.MATCHES_TABLE)
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Handle errors
    if (error) {
      throw new Error(`Failed to retrieve match data. ${error.message}`);
    }

    // Return the retrieved data
    return data ?? [];
  }
}
