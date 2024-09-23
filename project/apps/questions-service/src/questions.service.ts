import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateQuestionDto,
  DeleteQuestionDto,
  QuestionDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class QuestionsService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findAll(): Promise<QuestionDto[]> {
    const { data, error } = await this.supabase.from('questions').select();

    if (error) {
      console.log('Error fetching questions', error);
      return [];
    }

    return data;
  }

  async findById(id: bigint): Promise<QuestionDto | null> {
    const { data, error } = await this.supabase
      .from('questions')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.log('Error fetching question', error);
      return null;
    }

    return data;
  }

  async create(question: CreateQuestionDto): Promise<QuestionDto | null> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(question)
      .single();

    if (error) {
      console.log('Error creating question', error);
      return null;
    }

    return data;
  }

  async update(question: UpdateQuestionDto): Promise<QuestionDto | null> {
    const updatedQuestion = {
      ...question,
      updated_at: new Date(),
    };

    const { data, error } = await this.supabase
      .from('questions')
      .update(updatedQuestion)
      .eq('id', question.id)
      .single();

    if (error) {
      console.log('Error updating question', error);
      return null;
    }

    return data;
  }

  async delete(question: DeleteQuestionDto): Promise<boolean> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', question.id);

    if (error) {
      console.log('Error deleting question', error);
      return false;
    }

    return true;
  }
}
