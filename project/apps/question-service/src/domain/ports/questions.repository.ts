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

/**
 * Abstract class representing a repository for managing questions.
 * This class defines the contract for any concrete implementation of a questions repository.
 */
export abstract class QuestionsRepository {
  /**
   * Retrieves all questions that match the given filters.
   * @param filters - The criteria used to filter the questions.
   * @returns A promise that resolves to a QuestionCollectionDto object.
   */
  abstract findAll(filters: QuestionFiltersDto): Promise<QuestionCollectionDto>;

  /**
   * Retrieves a question by its unique identifier.
   * @param id - The unique identifier of the question.
   * @returns A promise that resolves to a QuestionDto object.
   */
  abstract findById(id: string): Promise<QuestionDto>;

  /**
   * Retrieves a random question that matches the given filters.
   * @param filters - The criteria used to filter the questions.
   * @returns A promise that resolves to the id of the question.
   */
  abstract findOneRandom(filters: CollabQuestionDto): Promise<string | null>;

  /**
   * Creates a new question with the given data.
   * @param data - The data for the new question.
   * @returns A promise that resolves to the created QuestionDto object.
   */
  abstract create(data: CreateQuestionDto): Promise<QuestionDto>;

  /**
   * Updates an existing question with the given data.
   * @param data - The updated data for the question.
   * @returns A promise that resolves to the updated QuestionDto object.
   */
  abstract update(data: UpdateQuestionDto): Promise<QuestionDto>;

  /**
   * Deletes a question by its unique identifier.
   * @param id - The unique identifier of the question to be deleted.
   * @returns A promise that resolves to the deleted QuestionDto object.
   */
  abstract delete(id: string): Promise<QuestionDto>;

  /**
   * Creates a new set of test cases for a question.
   * @param data - The data for the new test cases.
   * @returns A promise that resolves to the created TestCasesDto object.
   */
  abstract createTestCases(data: CreateTestCasesDto): Promise<TestCasesDto>;

  /**
   * Deletes test cases by their unique identifier.
   * @param testCaseId - The unique identifier of the test cases to be deleted.
   * @returns A promise that resolves to true if deletion was successful.
   */
  abstract deleteTestCases(testCaseId: string): Promise<boolean>;

  /**
   * Updates existing test cases for a question.
   * @param data - The updated data for the test cases.
   * @returns A promise that resolves to the updated TestCasesDto object.
   */
  abstract updateTestCases(data: UpdateTestCasesDto): Promise<TestCasesDto>;

  /**
   * Retrieves test cases by question ID.
   * @param questionId - The question ID to find associated test cases.
   * @returns A promise that resolves to a TestCasesDto object.
   */
  abstract findTestCasesByQuestionId(
    questionId: string,
  ): Promise<TestCasesDto | null>;
}
