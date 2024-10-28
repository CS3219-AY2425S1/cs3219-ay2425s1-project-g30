import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CollabCreateDto, CollabDto } from '@repo/dtos/collab';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@repo/dtos/generated/types/collaboration.types';
import { CollaborationRepository } from 'src/domain/ports/collaboration.repository';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class CollaborationSupabase implements CollaborationRepository {
  private readonly logger = new Logger(CollaborationSupabase.name);
  private supabase: SupabaseClient;

  private readonly COLLABORATION_TABLE = 'collaboration';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
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

  async verifyCollaborator(id: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select()
      .eq('id', id)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
  }

  async fetchDocumentById(id: string): Promise<Buffer | null> {
    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select('document')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }
    return this.parseDocument(data.document);
  }

  async storeDocumentById(id: string, state: any): Promise<void> {
    const hexState = this.bytesToHex(state);
    const { error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .update({ document: hexState })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }
  }

  bytesToHex = (src: number[]) =>
    '\\x' + src.reduce((s, n) => s + n.toString(16).padStart(2, '0'), '');

  parseDocument = (doc: string) => {
    if (!doc) {
      return null;
    }
    if (doc.startsWith('\\x')) {
      return Buffer.from(doc.substr(2), 'hex');
    } else {
      return Buffer.from(doc, 'base64');
    }
  };
}
