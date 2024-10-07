import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { collectionMetadataDto } from '@repo/dtos/metatdata';
import {
  GetQuestionsQueryDto,
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionCollectionDto,
} from '@repo/dtos/questions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { QuestionsRepository } from 'src/domain/ports/questions.repository';

@Injectable()
export class SupabaseQuestionsRepository implements QuestionsRepository {
  private supabase: SupabaseClient;

  private readonly QUESTIONS_TABLE = 'question_bank';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findAll(filters: GetQuestionsQueryDto): Promise<QuestionCollectionDto> {
    const { title, category, complexity, includeDeleted, offset, limit } =
      filters;

    let queryBuilder = this.supabase
      .from(this.QUESTIONS_TABLE)
      .select('*', { count: 'exact' });

    if (title) {
      queryBuilder = queryBuilder.ilike('q_title', `%${title}%`);
    }
    if (category) {
      queryBuilder = queryBuilder.contains('q_category', [category]);
    }
    if (complexity) {
      queryBuilder = queryBuilder.eq('q_complexity', complexity);
    }
    if (!includeDeleted) {
      queryBuilder = queryBuilder.is('deleted_at', null);
    }

    const totalCountQuery = queryBuilder;

    let dataQuery = queryBuilder;
    if (limit) {
      if (offset) {
        dataQuery = dataQuery.range(offset, offset + limit - 1); // Supabase range is inclusive
      } else {
        dataQuery = dataQuery.limit(limit);
      }
    }

    // Execute the data query
    const { data: questions, error } = await dataQuery;

    // Execute the total count query
    const { count: totalCount, error: totalCountError } = await totalCountQuery;

    if (error || totalCountError) {
      throw error || totalCountError;
    }

    const metadata: collectionMetadataDto = {
      count: questions ? questions.length : 0,
      totalCount: totalCount ?? 0,
    };

    return {
      metadata,
      questions,
    } as QuestionCollectionDto;
  }

  async findById(id: string): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .select()
      .eq('id', id)
      .single<QuestionDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async create(question: CreateQuestionDto): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .insert(question)
      .select()
      .single<QuestionDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(question: UpdateQuestionDto): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .update(question)
      .eq('id', question.id)
      .select()
      .single<QuestionDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id: string): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .update({ deleted_at: new Date() })
      .eq('id', id)
      .select()
      .single<QuestionDto>();

    if (error) {
      throw error;
    }

    return data;
  }
}
