import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetQuestionsQueryDto,
  QuestionDto,
  CreateQuestionDto,
  UpdateQuestionDto,
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

  async findAll(filters: GetQuestionsQueryDto): Promise<QuestionDto[]> {
    const { title, category, complexity, includeDeleted } = filters;

    let query = this.supabase.from(this.QUESTIONS_TABLE).select();

    if (title) {
      query = query.ilike('q_title', `%${title}%`);
    }
    if (category) {
      query = query.contains('q_category', [category]);
    }
    if (complexity) {
      query = query.eq('q_complexity', complexity);
    }
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
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
