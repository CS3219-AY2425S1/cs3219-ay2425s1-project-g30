import { CollabCreateDto, CollabDto } from '@repo/dtos/collab';

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
  abstract findById(id: string): Promise<CollabDto>;

  abstract findActive(userId: string): Promise<CollabDto[]>;
}
