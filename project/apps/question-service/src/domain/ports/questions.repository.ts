import { MatchCriteriaDto } from '@repo/dtos/match';
import {
  CreateQuestionDto,
  QuestionFiltersDto,
  QuestionCollectionDto,
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
  abstract findOneRandom(filters: MatchCriteriaDto): Promise<string>;

  /**
   * Retrieves a random question that matches the given filters.
   * @param filters - The criteria used to filter the questions.
   * @returns A promise that resolves to the id of the question.
   */
  abstract findOneRandom(filters: MatchCriteriaDto): Promise<string>;

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
