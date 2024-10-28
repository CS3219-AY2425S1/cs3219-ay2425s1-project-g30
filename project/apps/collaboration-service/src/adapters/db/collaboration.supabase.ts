import { BadRequestException, Injectable } from '@nestjs/common';
import { CollabCreateDto, CollabDto } from '@repo/dtos/collab';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CollaborationRepository } from 'src/domain/ports/collaboration.repository';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class CollaborationSupabase implements CollaborationRepository {
  private supabase: SupabaseClient;

  private readonly COLLABORATION_TABLE = 'collaboration';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  async findById(id: string): Promise<CollabDto | null> {
    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select()
      .eq('id', id)
      .maybeSingle<CollabDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async findByMatchId(matchId: string): Promise<CollabDto | null> {
    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select()
      .eq('match_id', matchId)
      .maybeSingle<CollabDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async create(collabData: CollabCreateDto) {
    // Check if data exists
    const existingCollab = await this.findByMatchId(collabData.match_id);

    if (existingCollab) {
      throw new BadRequestException(
        `Collaboration with match_id ${collabData.match_id} already exists`,
      );
    }

    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .insert(collabData)
      .select()
      .single<CollabDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async findActive(userId: string): Promise<CollabDto[]> {
    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .is('ended_at', null)
      .returns<CollabDto[]>();

    if (error) {
      throw error;
    }
    return data;
  }
}
