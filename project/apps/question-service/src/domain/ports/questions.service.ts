import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CreateQuestionDto,
  GetQuestionsQueryDto,
  QuestionDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';

import { QuestionsRepository } from 'src/domain/ports/questions.repository';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private readonly questionsRepository: QuestionsRepository) {}

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

  /**
   * Retrieves all questions that match the provided filters.
   *
   * @param {GetQuestionsQueryDto} filters - The filters to apply when fetching questions.
   * @returns {Promise<QuestionDto[]>} A promise that resolves to an array of QuestionDto objects.
   * @throws Will throw an error if the fetch operation fails.
   */
  async findAll(filters: GetQuestionsQueryDto): Promise<QuestionDto[]> {
    try {
      const questions = await this.questionsRepository.findAll(filters);

      this.logger.log(
        `fetched ${questions.length} questions with filters: ${JSON.stringify(filters)}`,
      );

      return questions;
    } catch (error) {
      this.handleError('fetch questions', error);
    }
  }

  /**
   * Fetches a question by its unique identifier.
   *
   * @param {string} id - The unique identifier of the question to be fetched.
   * @returns {Promise<QuestionDto>} A promise that resolves to the question data transfer object.
   * @throws Will throw an error if the question cannot be fetched.
   */
  async findById(id: string): Promise<QuestionDto> {
    try {
      const question = await this.questionsRepository.findById(id);

      this.logger.log(`fetched question with id ${id}`);

      return question;
    } catch (error) {
      this.handleError('fetch question by id', error);
    }
  }

  /**
   * Creates a new question.
   *
   * This method first checks if a question with the same title already exists.
   * If such a question exists, it throws a `BadRequestException`.
   * Otherwise, it creates a new question and logs the creation.
   *
   * @param {CreateQuestionDto} question - The data transfer object containing the details of the question to be created.
   * @returns {Promise<QuestionDto>} - A promise that resolves to the created question data transfer object.
   * @throws {BadRequestException} - If a question with the same title already exists.
   */
  async create(question: CreateQuestionDto): Promise<QuestionDto> {
    try {
      const filter: GetQuestionsQueryDto = {
        title: question.q_title,
        includeDeleted: true,
      };

      const existingQuestions = await this.questionsRepository.findAll(filter);

      // check if question with the same title already exists
      if (existingQuestions.length) {
        this.handleError(
          'create question',
          new BadRequestException(
            `Question with title ${question.q_title} already exists`,
          ),
        );
      }

      const createdQuestion = await this.questionsRepository.create(question);

      this.logger.log(`created question ${createdQuestion.id}`);

      return createdQuestion;
    } catch (error) {
      this.handleError('create question', error);
    }
  }

  /**
   * Updates an existing question.
   *
   * This method first checks if another question with the same title already exists.
   * If such a question exists, it throws a `BadRequestException`.
   * Otherwise, it updates the question and logs the update.
   *
   * @param {UpdateQuestionDto} question - The data transfer object containing the updated details of the question.
   * @returns {Promise<QuestionDto>} - A promise that resolves to the updated question data transfer object.
   * @throws {BadRequestException} - If another question with the same title already exists.
   */
  async update(question: UpdateQuestionDto): Promise<QuestionDto> {
    try {
      const filter: GetQuestionsQueryDto = {
        title: question.q_title,
        includeDeleted: true,
      };

      const existingQuestions = await this.questionsRepository.findAll(filter);

      // check if another question with the same title already exists
      if (existingQuestions.length && existingQuestions[0].id !== question.id) {
        this.handleError(
          'update question',
          new BadRequestException(
            `Question with title ${question.q_title} already exists`,
          ),
        );
      }
      const updatedQuestion = await this.questionsRepository.update(question);

      this.logger.log(`updated question with id ${question.id}`);

      return updatedQuestion;
    } catch (error) {
      this.handleError('update question', error);
    }
  }

  /**
   * Deletes a question by its unique identifier.
   *
   * This method first checks if the question has already been deleted.
   * If the question has already been deleted, it throws a `BadRequestException`.
   * Otherwise, it deletes the question and logs the deletion.
   *
   * @param {string} id - The unique identifier of the question to be deleted.
   * @returns {Promise<QuestionDto>} - A promise that resolves to the deleted question data transfer object.
   * @throws {BadRequestException} - If the question has already been deleted.
   */
  async deleteById(id: string): Promise<QuestionDto> {
    try {
      const existingQuestion = await this.questionsRepository.findById(id);

      if (existingQuestion.deleted_at) {
        this.handleError(
          'delete question',
          new BadRequestException(
            `Question with id ${id} has already been deleted`,
          ),
        );
      }

      const deletedQuestion = await this.questionsRepository.delete(id);

      this.logger.log(`deleted question with id ${id}`);

      return deletedQuestion;
    } catch (error) {
      this.handleError('delete question', error);
    }
  }
}
