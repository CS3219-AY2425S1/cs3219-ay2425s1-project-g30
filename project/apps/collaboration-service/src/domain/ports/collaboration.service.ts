import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CollabCreateDto, CollabDto } from '@repo/dtos/collab';

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
   * @param {CollabCreateDto} collabData - The data transfer object containing the details of the collaboration to be created.
   * @returns {Promise<CollabDto>} A promise that resolves to the created collaboration data transfer object.
   * @throws Will throw an error if the creation process fails.
   */
  async createCollab(collabData: CollabCreateDto): Promise<CollabDto> {
    try {
      const createdCollab = await this.collabRepository.create(collabData);
      this.logger.log(`Created collaboration with id: ${createdCollab.id}`);
      return createdCollab;
    } catch (error) {
      this.handleError('create collaboration', error);
    }
  }

  /**
   * Retrieves the active collaboration for a given user.
   *
   * @param userId - The ID of the user whose active collaboration is to be retrieved.
   * @returns A promise that resolves to the active collaboration data transfer object (CollabDto).
   * @throws Will handle and log any errors that occur during the retrieval process.
   */
  async getActiveCollab(userId: string): Promise<CollabDto> {
    try {
      const collabs = await this.collabRepository.findActive(userId);

      // we are assuming only one active collaboration per user for now
      const activeCollab = collabs[0];
      this.logger.log(
        `Found active collaboration ${activeCollab.id} for user ${userId}`,
      );

      return activeCollab;
    } catch (error) {
      this.handleError('get collaborations', error);
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
      // TODO: verify that the collaboration is still active

      return true;
    } catch (error) {
      this.handleError('verify collaboration', error);
    }
  }
}
