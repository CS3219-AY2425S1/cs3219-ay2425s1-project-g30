import {
  CreateQuestionDto,
  GetQuestionsQueryDto,
  QuestionDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';

/**
 * Abstract class representing a repository for managing questions.
 * This class defines the contract for any concrete implementation of a questions repository.
 */
export abstract class QuestionsRepository {
  /**
   * Retrieves all questions that match the given filters.
   * @param filters - The criteria used to filter the questions.
   * @returns A promise that resolves to an array of QuestionDto objects.
   */
  abstract findAll(filters: GetQuestionsQueryDto): Promise<QuestionDto[]>;

  /**
   * Retrieves a question by its unique identifier.
   * @param id - The unique identifier of the question.
   * @returns A promise that resolves to a QuestionDto object.
   */
  abstract findById(id: string): Promise<QuestionDto>;

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
}
