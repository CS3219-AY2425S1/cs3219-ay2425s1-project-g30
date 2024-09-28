import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import {
  CreateQuestionDto,
  GetQuestionsQueryDto,
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

  /**
   * Handles errors by logging the error message and throwing an RpcException.
   *
   * @private
   * @param {string} operation - The name of the operation where the error occurred.
   * @param {any} error - The error object that was caught. This can be any type of error, including a NestJS HttpException.
   * @throws {RpcException} - Throws an RpcException wrapping the original error.
   */
  private handleError(operation: string, error: any): never {
    this.logger.error(`Error at ${operation}: ${error.message}`);

    throw new RpcException(error);
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
      this.handleError('fetch questions', error);
    }

    this.logger.log(
      `fetched ${data.length} questions with filters: ${JSON.stringify(filters)}`,
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
    const { data: existingQuestion } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .select()
      .eq('q_title', question.q_title)
      .single<QuestionDto>();

    if (existingQuestion) {
      // this.handleError(
      //   'create question',
      //   new BadRequestException(
      //     `Question with title ${question.q_title} already exists`,
      //   ),
      // );
    }

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
    // check if the question is soft deleted
    const { data: deletedQuestion } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .select()
      .eq('id', question.id)
      .neq('deleted_at', null)
      .single<QuestionDto>();

    if (deletedQuestion) {
      this.handleError(
        'update question',
        new BadRequestException('Cannot update a deleted question'),
      );
    }

    // check if a question with the same title already exists
    const { data: existingQuestion } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .select()
      .eq('q_title', question.q_title)
      .neq('id', question.id)
      .single<QuestionDto>();

    if (existingQuestion) {
      this.handleError(
        'update question',
        new BadRequestException(
          `Question with title ${question.q_title} already exists`,
        ),
      );
    }

    const { data, error } = await this.supabase
      .from(this.QUESTIONS_TABLE)
      .update(question)
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
