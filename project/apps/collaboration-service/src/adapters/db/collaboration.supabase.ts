import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CollabCreateDto,
  CollabDto,
  CollabInfoDto,
  CollabQuestionDto,
} from '@repo/dtos/collab';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@repo/dtos/generated/types/collaboration.types';
import { CollaborationRepository } from 'src/domain/ports/collaboration.repository';
import { EnvService } from 'src/env/env.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { QuestionDto } from '@repo/dtos/questions';
import { UserDataDto } from '@repo/dtos/users';

@Injectable()
export class CollaborationSupabase implements CollaborationRepository {
  private supabase: SupabaseClient;

  private readonly COLLABORATION_TABLE = 'collaboration';

  constructor(
    private envService: EnvService,
    @Inject('QUESTION_SERVICE')
    private readonly questionServiceClient: ClientProxy,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
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

  async findAll(userId: string): Promise<CollabDto[]> {
    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .returns<CollabDto[]>();

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

  async checkActiveCollaborationById(id: string): Promise<boolean> {
    if (!(await this.findById(id))) {
      throw new NotFoundException(`Collaboration with id ${id} not found`);
    }

    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .select()
      .eq('id', id)
      .is('ended_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
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
      throw new NotFoundException(
        `Collaboration with id ${collabId} not found`,
      );
    }

    const { question_id, user1_id, user2_id } = collab;
    try {
      const [selectedQuestionData, user1Data, user2Data] = await Promise.all([
        firstValueFrom(
          this.questionServiceClient.send<QuestionDto>(
            { cmd: 'get_question' },
            question_id,
          ),
        ),
        firstValueFrom(
          this.userServiceClient.send<UserDataDto>(
            { cmd: 'get_user' },
            user1_id,
          ),
        ),
        firstValueFrom(
          this.userServiceClient.send<UserDataDto>(
            { cmd: 'get_user' },
            user2_id,
          ),
        ),
      ]);

      if (!selectedQuestionData) {
        throw new NotFoundException(
          `Question with id ${question_id} not found`,
        );
      }

      if (!user1Data) {
        throw new NotFoundException(`User with id ${user1_id} not found`);
      }

      if (!user2Data) {
        throw new NotFoundException(`User with id ${user2_id} not found`);
      }

      const collabInfoData: CollabInfoDto = {
        collab_user1: {
          id: user1Data.id,
          username: user1Data.username,
        },
        collab_user2: {
          id: user2Data.id,
          username: user2Data.username,
        },
        question: selectedQuestionData,
      };

      return collabInfoData;
    } catch (error) {
      throw new Error(`Failed to fetch collaboration info: ${error}`);
    }
  }

  async endCollab(collabId: string): Promise<CollabDto> {
    if (!(await this.checkActiveCollaborationById(collabId))) {
      throw new BadRequestException(
        `Collaboration with id ${collabId} is not active`,
      );
    }

    const { data, error } = await this.supabase
      .from(this.COLLABORATION_TABLE)
      .update({ ended_at: new Date() })
      .eq('id', collabId)
      .select()
      .single<CollabDto>();

    if (error) {
      throw error;
    }
    return data;
  }
}
