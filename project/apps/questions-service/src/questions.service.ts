import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateQuestionDto,
  QuestionDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class QuestionsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(QuestionsService.name);

  private readonly QUESTIONS_TABLE = 'question_bank';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private handleError(operation: string, error: unknown): never {
    this.logger.error(`Error during ${operation}:`, error);
    throw error;
  }

  async findAll(includeDeleted: boolean = false): Promise<QuestionDto[]> {
    const query = this.supabase.from(this.QUESTIONS_TABLE).select();

    if (!includeDeleted) {
      query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) {
      this.handleError('fetch questions', error);
    }

    this.logger.log(
      `fetched ${data.length} questions, includeDeleted: ${includeDeleted}`,
    );
    return data;
  }

  async findById(id: string): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      this.handleError('fetch question by id', error);
    }

    this.logger.log(`fetched question with id ${id}`);
    return data;
  }

  async create(question: CreateQuestionDto): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .insert(question)
      .select()
      .single<QuestionDto>();

    if (error) {
      this.handleError('create question', error);
    }

    this.logger.log(`created question ${data.id}`);
    return data;
  }

  async update(question: UpdateQuestionDto): Promise<QuestionDto> {
    const updatedQuestion = {
      ...question,
      updated_at: new Date(),
    };

    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .update(updatedQuestion)
      .eq('id', question.id)
      .select()
      .single();

    if (error) {
      this.handleError('update question', error);
    }

    this.logger.log(`updated question with id ${question.id}`);
    return data;
  }

  async deleteById(id: string): Promise<QuestionDto> {
    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .update({ deleted_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.handleError('delete question', error);
    }

    this.logger.log(`deleted question with id ${id}`);
    return data;
  }
}
