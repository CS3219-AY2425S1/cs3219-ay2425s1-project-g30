import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CollabCollectionDto,
  CollabCreateDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  CollabQuestionDto,
  ExecutionSnapshotCollectionDto,
  ExecutionSnapshotCreateDto,
  ExecutionSnapshotDto,
} from '@repo/dtos/collab';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@repo/dtos/generated/types/collaboration.types';
import { CollaborationRepository } from 'src/domain/ports/collaboration.repository';
import { EnvService } from 'src/env/env.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  QuestionCollectionDto,
  QuestionDto,
  QuestionFiltersDto,
} from '@repo/dtos/questions';
import { UserDataDto } from '@repo/dtos/users';
import { collectionMetadataDto } from '@repo/dtos/metadata';

@Injectable()
export class CollaborationSupabase implements CollaborationRepository {
  private supabase: SupabaseClient;

  private readonly COLLABORATION_TABLE = 'collaboration';
  private readonly SNAPSHOT_TABLE = 'snapshots';

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

  async findAll(filters: CollabFiltersDto): Promise<CollabCollectionDto> {
    const {
      user_id,
      collab_user_id,
      has_ended,
      offset,
      limit,
      sort,
      q_title,
      q_category,
      q_complexity,
    } = filters;

    let filteredQuestionIds = null;
    if (q_title || q_category || q_complexity) {
      // query for questions that match the filters
      const questionFilters: QuestionFiltersDto = {
        title: q_title,
        categories: q_category,
        complexities: q_complexity,
        includeDeleted: true,
      };

      // get the filtered question ids
      // we have to call the question service to get the filtered questions as we don't have direct access to the questions
      const filteredQuestions = await firstValueFrom(
        this.questionServiceClient.send<QuestionCollectionDto>(
          { cmd: 'get_questions' },
          questionFilters,
        ),
      );

      filteredQuestionIds = filteredQuestions.questions.map((q) => q.id);
    }

    let queryBuilder = this.supabase
      .from(this.COLLABORATION_TABLE)
      .select('*', { count: 'exact' });

    if (filteredQuestionIds) {
      queryBuilder = queryBuilder.in('question_id', filteredQuestionIds);
    }

    // Apply user filtering
    if (user_id && collab_user_id) {
      // Both user_id and collab_user_id are provided
      queryBuilder = queryBuilder.or(
        `and(user1_id.eq.${user_id},user2_id.eq.${collab_user_id}),and(user1_id.eq.${collab_user_id},user2_id.eq.${user_id})`,
      );
    } else if (user_id) {
      // Only user_id is provided
      queryBuilder = queryBuilder.or(
        `user1_id.eq.${user_id},user2_id.eq.${user_id}`,
      );
    }

    if (has_ended) {
      queryBuilder = queryBuilder.not('ended_at', 'is', null);
    } else {
      queryBuilder = queryBuilder.is('ended_at', null);
    }

    // Apply sorting
    if (sort) {
      for (const s of sort) {
        queryBuilder = queryBuilder.order(s.field, {
          ascending: s.order === 'asc',
        });
      }
    }

    const totalCountQuery = queryBuilder;

    let dataQuery = queryBuilder;
    if (limit) {
      if (offset !== undefined) {
        dataQuery = dataQuery.range(offset, offset + limit - 1);
      } else {
        dataQuery = dataQuery.limit(limit);
      }
    }

    // Execute the data query
    const { data: collabs, error } = await dataQuery;

    // Execute the total count query
    const { count: totalCount, error: totalCountError } = await totalCountQuery;

    if (error || totalCountError) {
      throw error || totalCountError;
    }

    const metadata: collectionMetadataDto = {
      count: collabs ? collabs.length : 0,
      totalCount: totalCount ?? 0,
    };

    // get collabInfo for each collab retrieved
    const collabInfoPromises = collabs.map((collab) =>
      this.fetchCollabInfo(collab.id),
    );

    const collabInfoData = await Promise.all(collabInfoPromises);

    // get partner info for each collab retrieved
    const collabInfoWithPartnerData = collabInfoData.map((collab) => {
      if (collab) {
        const partner =
          collab.collab_user1.id === user_id
            ? collab.collab_user2
            : collab.collab_user1;
        return { ...collab, partner } as CollabInfoDto;
      }
      return;
    });

    // return the collection
    return {
      metadata,
      collaborations: collabInfoWithPartnerData,
    } as CollabCollectionDto;
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

  async getRandomQuestion(filters: CollabQuestionDto): Promise<string | null> {
    // Call the question service to get a random question based on the filters
    const selectedQuestionId = await firstValueFrom(
      this.questionServiceClient.send<string>(
        { cmd: 'get_random_question' },
        filters,
      ),
    );
    return selectedQuestionId;
  }

  async fetchCollabInfo(collabId: string): Promise<CollabInfoDto | null> {
    const collab = await this.findById(collabId);
    if (!collab) {
      return null;
    }

    const { question_id, user1_id, user2_id } = collab;
    const [selectedQuestionData, user1Data, user2Data] = await Promise.all([
      firstValueFrom(
        this.questionServiceClient.send<QuestionDto>(
          { cmd: 'get_question' },
          question_id,
        ),
      ),
      firstValueFrom(
        this.userServiceClient.send<UserDataDto>({ cmd: 'get_user' }, user1_id),
      ),
      firstValueFrom(
        this.userServiceClient.send<UserDataDto>({ cmd: 'get_user' }, user2_id),
      ),
    ]);

    if (!selectedQuestionData) {
      throw new NotFoundException(`Question with id ${question_id} not found`);
    }

    if (!user1Data) {
      throw new NotFoundException(`User with id ${user1_id} not found`);
    }

    if (!user2Data) {
      throw new NotFoundException(`User with id ${user2_id} not found`);
    }

    const collabInfoData: CollabInfoDto = {
      id: collabId,

      started_at: collab.started_at,
      ended_at: collab.ended_at,

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

  async getSnapshotsByCollabId(
    id: string,
  ): Promise<ExecutionSnapshotCollectionDto> {
    const { data: snapshots, error } = await this.supabase
      .from(this.SNAPSHOT_TABLE)
      .select()
      .eq('collaboration_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const count = snapshots ? snapshots.length : 0;

    return {
      metadata: {
        count,
        totalCount: count,
      },
      snapshots,
    };
  }

  async createSnapshot(
    data: ExecutionSnapshotCreateDto,
  ): Promise<ExecutionSnapshotDto> {
    // Check if the collaboration exists
    const collab = await this.findById(data.collaboration_id);
    if (!collab) {
      throw new NotFoundException(
        `Collaboration with id ${data.collaboration_id} not found`,
      );
    }

    // Check if the collaboration has ended
    if (collab.ended_at) {
      throw new BadRequestException(
        `Collaboration with id ${data.collaboration_id} has ended`,
      );
    }

    const { data: snapshot, error } = await this.supabase
      .from(this.SNAPSHOT_TABLE)
      .insert(data)
      .select()
      .single<ExecutionSnapshotDto>();

    if (error) {
      throw error;
    }

    return snapshot;
  }
}
