import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CollabCollectionDto,
  CollabCreateDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  CollabInfoWithDocumentDto,
  CollabQuestionDto,
  CollabRequestDto,
} from '@repo/dtos/collab';
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

      if (selectedQuestionId === '') {
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
   * Fetches the information of an active collaboration including the selected question data by its unique identifier.
   * @param collabId - The unique identifier of the collaboration to be fetched.
   * @returns A promise that resolves to the collaboration information data transfer object.
   *          If the collaboration is not active, the promise will resolve to null.
   * @throws Will handle and log any errors that occur during the retrieval process.
   */

  async getActiveCollabInfo(collabId: string): Promise<CollabInfoDto | null> {
    try {
      const collab = await this.collabRepository.fetchCollabInfo(collabId);
      const isActive =
        await this.collabRepository.checkActiveCollaborationById(collabId);

      if (!collab) {
        throw new Error(`Collaboration with id ${collabId} not found`);
      }

      this.logger.log(`Fetched collaboration with id: ${collabId}`);

      return isActive ? collab : null;
    } catch (error) {
      this.handleError('get collaboration info', error);
    }
  }

  /**
   * Fetches the collaboration information and associated document of a collaboration by its unique identifier.
   * @param collabId - The unique identifier of the collaboration to be fetched.
   * @returns A promise that resolves to the collaboration information with document data transfer object.
   * @throws Will handle and log any errors that occur during the retrieval process.
   */
  async getCollabInfoAndDocument(
    collabId: string,
  ): Promise<CollabInfoWithDocumentDto> {
    try {
      const collab =
        await this.collabRepository.fetchCollabInfoWithDocument(collabId);

      if (!collab) {
        throw new Error(`Collaboration with id ${collabId} not found`);
      }

      this.logger.debug(`Found collaboration document with id: ${collabId}`);

      return collab;
    } catch (error) {
      this.handleError('get collaboration document', error);
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
}
