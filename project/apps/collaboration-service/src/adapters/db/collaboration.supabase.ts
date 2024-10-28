import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CollabCreateDto, CollabDto, CollabInfoDto, CollabQuestionDto } from '@repo/dtos/collab';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@repo/dtos/generated/types/collaboration.types';
import { CollaborationRepository } from 'src/domain/ports/collaboration.repository';
import { EnvService } from 'src/env/env.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { QuestionDto } from '@repo/dtos/questions';

@Injectable()
export class CollaborationSupabase implements CollaborationRepository {
  private supabase: SupabaseClient;

  private readonly COLLABORATION_TABLE = 'collaboration';

  constructor(private envService: EnvService,
    @Inject('QUESTION_SERVICE')
    private readonly questionServiceClient: ClientProxy,
  ) {
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

  async getRandomQuestion(filters: CollabQuestionDto): Promise<string> {
    // Call the question service to get a random question based on the filters
    const selectedQuestionId = await firstValueFrom(
      this.questionServiceClient.send<string>(
        { cmd: 'get_random_question' },
        filters,
      ),
    );
    return selectedQuestionId;
  }

  async fetchCollabInfo(collabId: string): Promise<CollabInfoDto> {
    const collab = await this.findById(collabId);

    if (!collab) {
      throw new Error(`Collaboration with id ${collabId} not found`);
    }

    const selectedQuestionData = await firstValueFrom(
      this.questionServiceClient.send<QuestionDto>(
        { cmd: 'get_question' },
        collab.question_id,
      ),
    );
    
    if (!selectedQuestionData) {
      throw new Error(`Question with id ${collab.question_id} not found`);
    }

    const collabInfoData: CollabInfoDto = {
      complexity: collab.complexity,
      category: collab.category,
      user1_id: collab.user1_id,
      user2_id: collab.user2_id,
      match_id: collab.match_id,
      question: selectedQuestionData,
    }

    return collabInfoData;
  }

}
