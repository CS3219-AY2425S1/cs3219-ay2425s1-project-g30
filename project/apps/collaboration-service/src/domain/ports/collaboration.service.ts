import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CollabCollectionDto,
  CollabCreateDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  CollabQuestionDto,
  CollabRequestDto,
  collabUpdateLanguageDto,
  ExecutionSnapshotCreateDto,
} from '@repo/dtos/collab';
import {
  AttemptCollectionDto,
  AttemptDto,
  AttemptFiltersDto,
} from '@repo/dtos/attempt';
import { CollaborationRepository } from 'src/domain/ports/collaboration.repository';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(private readonly collabRepository: CollaborationRepository) {}

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
   * Creates a new collaboration entry in the repository.
   *
   * @param {CollabRequestDto} collabReqData - The data transfer object containing the details of the collaboration request to be created.
   * @returns {Promise<string>} A promise that resolves to the created collaboration data transfer object.
   * @throws Will throw an error if the creation process fails.
   */
  async createCollab(collabReqData: CollabRequestDto): Promise<string> {
    try {
      const filters: CollabQuestionDto = {
        category: collabReqData.category,
        complexity: collabReqData.complexity,
      };

      const selectedQuestionId =
        await this.collabRepository.getRandomQuestion(filters);

      if (!selectedQuestionId) {
        throw new Error(
          `No suitable questions found for match id ${collabReqData.match_id}`,
        );
      }

      const collabCreateData: CollabCreateDto = {
        user1_id: collabReqData.user1_id,
        user2_id: collabReqData.user2_id,
        match_id: collabReqData.match_id,
        question_id: selectedQuestionId,
      };

      const createdCollab =
        await this.collabRepository.create(collabCreateData);

      if (!createdCollab) {
        throw new Error('Failed to create collaboration');
      }
      this.logger.log(`Created collaboration with id: ${createdCollab.id}`);
      return createdCollab.id;
    } catch (error) {
      this.handleError('create collaboration', error);
    }
  }

  /**
   * Retrieves all collaborations for a given user based on a given set of filters.
   * @param filters - The filters to apply when fetching collaborations.
   * @returns A promise that resolves to a collection of collaborations.
   * @throws Will handle and log any errors that occur during the retrieval process.
   */
  async getAllCollabs(filters: CollabFiltersDto): Promise<CollabCollectionDto> {
    try {
      const collabCollection = await this.collabRepository.findAll(filters);
      this.logger.log(
        `Fetched ${collabCollection.metadata.count} collaborations with filters: ${JSON.stringify(filters)}`,
      );

      return collabCollection;
    } catch (error) {
      this.handleError('get all collaborations', error);
    }
  }

  /**
   * Fetches the information of an collaboration including the selected question data by its unique identifier.
   * @param collabId - The unique identifier of the collaboration to be fetched.
   * @returns A promise that resolves to the collaboration information data transfer object.
   * @throws Will handle and log any errors that occur during the retrieval process.
   */

  async getCollabInfo(collabId: string): Promise<CollabInfoDto> {
    try {
      const collab = await this.collabRepository.fetchCollabInfo(collabId);
      if (!collab) {
        throw new Error(`Collaboration with id ${collabId} not found`);
      }

      this.logger.log(`Fetched collaboration with id: ${collabId}`);

      return collab;
    } catch (error) {
      this.handleError('get collaboration info', error);
    }
  }

  /**
   * Verifies that a collaboration is still active.
   *
   * @param collabId - The ID of the collaboration to verify.
   * @returns A promise that resolves to a boolean indicating whether the collaboration is still active.
   * @throws Will handle and log any errors that occur during the verification process.
   */
  async verifyCollab(collabId: string): Promise<boolean> {
    try {
      this.logger.debug(`Verifying collaboration: ${collabId}`);
      return await this.collabRepository.checkActiveCollaborationById(collabId);
    } catch (error) {
      this.handleError('verify collaboration', error);
    }
  }

  /**
   * Updates the language of a collaboration by its unique identifier.
   *
   * @param collabLanguageData - The data transfer object containing the details of the language update.
   * @returns A promise that resolves to the updated collaboration information data transfer object.
   * @throws Will handle and log any errors that occur during the update process.
   */
  async updateCollabLanguage(collabLanguageData: collabUpdateLanguageDto) {
    try {
      return await this.collabRepository.updateCollabLanguage(
        collabLanguageData,
      );
    } catch (error) {
      this.handleError('update collaboration language', error);
    }
  }

  /**
   * Ends a collaboration by its unique identifier.
   * @param collabId - The unique identifier of the collaboration to be ended.
   *
   */
  async endCollab(collabId: string): Promise<CollabDto> {
    try {
      this.logger.log(`Ending collaboration: ${collabId}`);
      return await this.collabRepository.endCollab(collabId);
    } catch (error) {
      this.handleError('end collaboration', error);
    }
  }

  /**
   * Checks if a user has an active collaboration
   * @param userId The unique identifier of the user.
   */
  async checkActiveCollabs(userId: string): Promise<boolean> {
    try {
      this.logger.log(`Checking Active Collaborations: ${userId}`);
      return await this.collabRepository.checkActiveCollabs(userId);
    } catch (error) {
      this.handleError('checking active collaborations', error);
    }
  }

  /**
   * Retrieves all attempts for a collaboration by its unique identifier.
   * @param collabId - The unique identifier of the collaboration to fetch attempts for.
   * @returns A promise that resolves to a collection of attempts.
   */
  async getAttempts(filters: AttemptFiltersDto): Promise<AttemptCollectionDto> {
    try {
      const collabId = filters.collab_id;
      const collab = await this.collabRepository.fetchCollabInfo(collabId);

      if (!collab) {
        throw new Error(`Collaboration with id ${collabId} not found`);
      }
      if (!collab.ended_at) {
        throw new Error(
          `Collaboration with id ${collabId} is still active. Cannot fetch attempts.`,
        );
      }

      // final submission document data
      const document = await this.collabRepository.fetchDocumentById(collabId);
      const document_data = document ? Array.from(document) : null;
      const final_submission: AttemptDto = {
        id: collabId,
        name: 'Final Submission',
        created_at: collab.ended_at,
        language: collab.language,
        document: document_data,
        code: null,
        output: null,
      };

      // code execution attempts
      const snapshotCollection =
        await this.collabRepository.getSnapshots(filters);
      const codeExecutionAttempts = snapshotCollection.snapshots.map(
        (snapshot, index) => {
          return {
            id: snapshot.id,
            name: `Attempt ${snapshotCollection.metadata.count - index}`, // in descending order
            created_at: snapshot.created_at,
            language: snapshot.language,
            document: null,
            code: snapshot.code,
            output: snapshot.output,
          } satisfies AttemptDto;
        },
      );

      const allAttempts = [final_submission, ...codeExecutionAttempts];

      const attemptCollection: AttemptCollectionDto = {
        attempts: allAttempts,
        metadata: {
          count: snapshotCollection.metadata.count + 1, // add 1 for final submission
          totalCount: snapshotCollection.metadata.totalCount + 1, // add 1 for final submission
        },
      };
      return attemptCollection;
    } catch (error) {
      this.handleError('get attempts', error);
    }
  }

  /**
   * Creates a new execution snapshot entry in the repository.
   *
   * @param snapshot The data transfer object containing the details of the execution snapshot to be created.
   * @returns A promise that resolves to the created execution snapshot data transfer object.
   * @throws Will handle and log any errors that occur during the creation process.
   */
  async createSnapshot(snapshot: ExecutionSnapshotCreateDto) {
    try {
      return await this.collabRepository.createSnapshot(snapshot);
    } catch (error) {
      this.handleError('create snapshot', error);
    }
  }
}
