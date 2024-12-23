import { AttemptFiltersDto } from '@repo/dtos/attempt';
import {
  CollabCollectionDto,
  CollabCreateDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  CollabQuestionDto,
  collabUpdateLanguageDto,
  ExecutionSnapshotCollectionDto,
  ExecutionSnapshotCreateDto,
  ExecutionSnapshotDto,
} from '@repo/dtos/collab';

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
   * Fetches all collaboration entries for a given user.
   * @param filters - The filters to apply when fetching collaborations.
   * @returns A promise that resolves to a collection of collaborations.
   */
  abstract findAll(filters: CollabFiltersDto): Promise<CollabCollectionDto>;

  /**
   * Check if a collaboration is active by its unique identifier.
   * @param id
   * @returns A promise that resolves to true if the collaboration is active, or false otherwise.
   */
  abstract checkActiveCollaborationById(id: string): Promise<boolean>;

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
  abstract getRandomQuestion(
    filters: CollabQuestionDto,
  ): Promise<string | null>;

  /**
   * Fetches the collaboration information for a given collaboration id. If no collaboration is found, returns null.
   * @param id The unique identifier of the collaboration to fetch information for.
   * @returns A promise that resolves to the collaboration information data transfer object.
   */
  abstract fetchCollabInfo(id: string): Promise<CollabInfoDto | null>;

  /**
   * Updates the language of a collaboration by its unique identifier.
   * @param collabLanguageData The data transfer object containing the details of the language update.
   * @returns A promise that resolves to the updated collaboration data transfer object.
   */
  abstract updateCollabLanguage(
    collabLanguageData: collabUpdateLanguageDto,
  ): Promise<CollabDto>;

  /**
   * Ends a collaboration by its unique identifier.
   * @param id The unique identifier of the collaboration to end.
   */
  abstract endCollab(id: string): Promise<CollabDto>;

  /**
   * Checks if a user has an active collaboration
   * @param userId The unique identifier of the user.
   */
  abstract checkActiveCollabs(userId: string): Promise<boolean>;

  /**
   * Fetches all attempts for a collaboration that match the given filters.
   * @param filters The filters to apply when fetching attempts.
   * @returns A promise that resolves to a collection of attempts.
   */
  abstract getSnapshots(
    filters: AttemptFiltersDto,
  ): Promise<ExecutionSnapshotCollectionDto>;

  /**
   * Creates a snapshot of the execution state of a document, if the collaboration session has not ended.
   * @param data The data transfer object containing the details of the snapshot to be created.
   * @returns A promise that resolves to the created snapshot data transfer object.
   */
  abstract createSnapshot(
    data: ExecutionSnapshotCreateDto,
  ): Promise<ExecutionSnapshotDto>;
}
