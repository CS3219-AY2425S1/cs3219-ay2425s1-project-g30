import { Injectable } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { collectionMetadataDto } from '@repo/dtos/metadata';
import {
  QuestionFiltersDto,
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionCollectionDto,
} from '@repo/dtos/questions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { QuestionsRepository } from 'src/domain/ports/questions.repository';
import { MatchCriteriaDto } from '@repo/dtos/match';

@Injectable()
export class SupabaseQuestionsRepository implements QuestionsRepository {
  private supabase: SupabaseClient;

  private readonly QUESTIONS_TABLE = 'question_bank';
  private readonly RANDOM_ORDERED_QUESTIONS_TABLE = 'random_question';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findAll(filters: QuestionFiltersDto): Promise<QuestionCollectionDto> {
    const {
      title,
      categories,
      complexities,
      includeDeleted,
      offset,
      limit,
      sort,
    } = filters;

    let queryBuilder = this.supabase
      .from(this.QUESTIONS_TABLE)
      .select('*', { count: 'exact' });

    if (title) {
      queryBuilder = queryBuilder.ilike('q_title', `%${title}%`);
    }
    if (categories) {
      // result must match ALL categories provided
      queryBuilder = queryBuilder.contains('q_category', categories);
    }
    if (complexities) {
      // result must match ANY complexity provided
      queryBuilder = queryBuilder.in('q_complexity', complexities);
    }
    if (!includeDeleted) {
      queryBuilder = queryBuilder.is('deleted_at', null);
    }
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

  async findOneRandom(filters: MatchCriteriaDto): Promise<string> {
    const { category, complexity } = filters;

    // Serialize the category array to a string for filter pgres query
    const escaped = category.map((item) =>
      item.replace(/\\/g, '\\\\').replace(/"/g, '\\"'),
    );
    const categories = `{${escaped.map((item) => `"${item}"`).join(',')}}`;

    const { data, error } = await this.supabase
      .from(this.RANDOM_ORDERED_QUESTIONS_TABLE)
      .select('id')
      .eq('q_complexity', complexity)
      .filter('q_category', 'ov', categories)
      .limit(1)
      .single<QuestionDto>();

    if (error) {
      return '';
    }

    return data.id;
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
