import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CollabQuestionDto } from '@repo/dtos/collab';
import {
  CreateQuestionDto,
  QuestionFiltersDto,
  QuestionCollectionDto,
  QuestionDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';
import {
  TestCasesDto,
  CreateTestCasesDto,
  UpdateTestCasesDto,
} from '@repo/dtos/testCases';

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
   * Retrieves all questions based on the provided filters.
   *
   * @param {QuestionFiltersDto} filters - The filters to apply when fetching questions.
   * @returns {Promise<QuestionCollectionDto>} A promise that resolves to a collection of questions.
   * @throws Will throw an error if the questions cannot be fetched.
   */
  async findAll(filters: QuestionFiltersDto): Promise<QuestionCollectionDto> {
    try {
      const questionCollection =
        await this.questionsRepository.findAll(filters);

      this.logger.log(
        `fetched ${questionCollection.metadata.count} questions with filters: ${JSON.stringify(filters)}`,
      );

      return questionCollection;
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
   * Fetches a random question based on the provided filters.
   * @param {CollabQuestionDto} filters - The filters to apply when fetching the question
   * @returns {string} A promise that resolves to the id of the question
   */
  async findRandom(filters: CollabQuestionDto): Promise<string | null> {
    try {
      const randomQuestionId =
        await this.questionsRepository.findOneRandom(filters);
      if (randomQuestionId) {
        this.logger.log(
          `fetched random question ${randomQuestionId} for filters: ${JSON.stringify(filters)}`,
        );
      } else {
        this.logger.log(
          `no random question found for filters: ${JSON.stringify(filters)}`,
        );
      }

      return randomQuestionId;
    } catch (error) {
      this.handleError('fetch random question', error);
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
      const filter: QuestionFiltersDto = {
        title: question.q_title,
        includeDeleted: true,
      };

      const existingQuestionCollection =
        await this.questionsRepository.findAll(filter);

      // check if question with the same title already exists
      if (existingQuestionCollection.metadata.count) {
        throw new BadRequestException(
          `Question with title ${question.q_title} already exists`,
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
      const filter: QuestionFiltersDto = {
        title: question.q_title,
        includeDeleted: true,
      };

      const existingQuestionCollection =
        await this.questionsRepository.findAll(filter);

      // check if another question with the same title already exists
      if (
        existingQuestionCollection.metadata.count &&
        existingQuestionCollection.questions[0].id !== question.id
      ) {
        throw new BadRequestException(
          `Question with title ${question.q_title} already exists`,
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
        throw new BadRequestException(
          `Question with id ${id} has already been deleted`,
        );
      }

      const deletedQuestion = await this.questionsRepository.delete(id);

      this.logger.log(`deleted question with id ${id}`);

      return deletedQuestion;
    } catch (error) {
      this.handleError('delete question', error);
    }
  }

  /**
   * Creates new test cases for a question.
   * @param {CreateTestCasesDto} testCases - The test cases data transfer object to create.
   * @returns {Promise<TestCasesDto>} - A promise that resolves to the created test cases.
   */
  async createTestCases(testCases: CreateTestCasesDto): Promise<TestCasesDto> {
    try {
      const createdTestCases =
        await this.questionsRepository.createTestCases(testCases);
      this.logger.log(
        `created test cases for question with id ${testCases.question_id}`,
      );
      return createdTestCases;
    } catch (error) {
      this.handleError('create test cases', error);
    }
  }

  /**
   * Deletes test cases by their unique identifier.
   *
   * @param {string} testCaseId - The unique identifier of the test cases to be deleted.
   * @returns {Promise<boolean>} - A promise that resolves to true if deletion was successful.
   * @throws Will throw an error if the deletion fails.
   */
  async deleteTestCases(testCaseId: string): Promise<boolean> {
    try {
      const result = await this.questionsRepository.deleteTestCases(testCaseId);
      this.logger.log(`Deleted test cases with id ${testCaseId}`);
      return result;
    } catch (error) {
      this.handleError('delete test cases', error);
    }
  }

  /**
   * Updates existing test cases for a question.
   * @param {UpdateTestCasesDto} testCases - The updated test cases data transfer object.
   * @returns {Promise<TestCasesDto>} - A promise that resolves to the updated test cases.
   */
  async updateTestCases(testCases: UpdateTestCasesDto): Promise<TestCasesDto> {
    try {
      const updatedTestCases =
        await this.questionsRepository.updateTestCases(testCases);
      this.logger.log(`updated test cases with id ${testCases.id}`);
      return updatedTestCases;
    } catch (error) {
      this.handleError('update test cases', error);
    }
  }

  /**
   * Finds test cases by question ID.
   * @param {string} questionId - The ID of the question.
   * @returns {Promise<TestCasesDto | null>} - A promise that resolves to the test cases or null if not found.
   */
  async findTestCasesByQuestionId(
    questionId: string,
  ): Promise<TestCasesDto | null> {
    try {
      const testCases =
        await this.questionsRepository.findTestCasesByQuestionId(questionId);
      this.logger.log(`fetched test cases for question with id ${questionId}`);
      return testCases;
    } catch (error) {
      this.handleError('fetch test cases by question id', error);
    }
  }
}
