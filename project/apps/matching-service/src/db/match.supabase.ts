import { Inject, Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvService } from 'src/env/env.service';
import {
  matchDataSchema,
  MatchDataDto,
  MatchCriteriaDto,
} from '@repo/dtos/match';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MatchSupabase {
  private supabase: SupabaseClient;

  private readonly MATCHES_TABLE = 'matches';

  constructor(
    private envService: EnvService,
    @Inject('QUESTION_SERVICE')
    private readonly questionServiceClient: ClientProxy,
  ) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');
    console.log(supabaseKey);
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

  /**
   * Retrieves a random question based on the selected matching categories and complexity
   * @param filters The selected matching categories and complexity
   * @returns The id of the selected question
   */

  async getRandomQuestion(filters: MatchCriteriaDto): Promise<string> {
    // Call the question service to get a random question based on the filters
    const selectedQuestionId = await firstValueFrom(
      this.questionServiceClient.send<string>(
        { cmd: 'get_random_question' },
        filters,
      ),
    );
    return selectedQuestionId;
  }
}
