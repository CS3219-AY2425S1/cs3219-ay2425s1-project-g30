import { CollabCreateDto, CollabDto, CollabInfoDto, CollabQuestionDto } from '@repo/dtos/collab';

/**
 * Abstract class representing a repository for managing collaborations.
 * This class defines the methods that any concrete implementation must provide.
 */
export abstract class CollaborationRepository {
  /**
   * Creates a new collaboration entry in the repository.
   *
   * @param data - The data transfer object containing the details of the collaboration to be created.
   * @returns A promise that resolves to the created collaboration data transfer object.
   */
  abstract create(data: CollabCreateDto): Promise<CollabDto>;

  /**
   * Finds a collaboration entry by its unique identifier.
   *
   * @param id - The unique identifier of the collaboration to be found.
   * @returns A promise that resolves to the found collaboration data transfer object, or null if not found.
   */
  abstract findById(id: string): Promise<CollabDto | null>;

  /**
   * Finds a collaboration entry by its unique match identifier.
   *
   * @param matchId - The unique match identifier of the collaboration to be found.
   * @returns A promise that resolves to the found collaboration data transfer object, or null if not found.
   */
  abstract findByMatchId(matchId: string): Promise<CollabDto | null>;

  /**
   * Finds all active collaborations for a given user.
   * @param userId - The unique identifier of the user whose active collaborations are to be found.
   * @returns A promise that resolves to an array of active collaboration data transfer objects.
   */
  abstract findActive(userId: string): Promise<CollabDto[]>;

  /**
   * Checks if a user is a collaborator on a document, given the document's unique identifier and the user's unique identifier.
   * @param id - The unique identifier of the collaboration entry containing the document to be checked.
   * @param userId - The unique identifier of the user to be checked.
   * @returns A promise that resolves to true if the user is a collaborator, or false otherwise.
   */
  abstract verifyCollaborator(id: string, userId: string): Promise<boolean>;
  
  /**
   * Fetches a document by its unique identifier. Used by the Hocuspocus server to retrieve the state of a document.
   * @param id - The unique identifier of the collaboration entry containing the document to be fetched.
   * @returns A promise that resolves to the document state, or null if not found.
   */
  abstract fetchDocumentById(id: string): Promise<Buffer | null>;

  /**
   * Stores a document by its unique identifier. Used by the Hocuspocus server to update the state of a document.
   * @param id - The unique identifier of the collaboration entry containing the document to be stored.
   * @param state - The new state of the document to be stored.
   */
  abstract storeDocumentById(id: string, state: any): Promise<void>;
  
  /**
   * Retrieves a random question from the question database that matches the given filters.
   * @param filters - The filters to apply when selecting a question.
   * @returns A promise that resolves to the selected question id.
   */
  abstract getRandomQuestion(filters: CollabQuestionDto): Promise<string>;

  /**
   * Fetches the collaboration information for a given collaboration id.
   * @param id The unique identifier of the collaboration to fetch information for.
   * @returns A promise that resolves to the collaboration information data transfer object.
   */
  abstract fetchCollabInfo(id: string): Promise<CollabInfoDto>;
}
