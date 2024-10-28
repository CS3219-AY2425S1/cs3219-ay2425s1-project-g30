import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UserCollectionDto,
  UserDataDto,
  UserFiltersDto,
} from '@repo/dtos/users';

import { UsersRepository } from 'src/domain/ports/users.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

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
   * Retrieves all users.
   *
   * @param {UserFiltersDto} filters - The filters to apply when fetching users
   * @returns {Promise<UserCollectionDto>} A promise that resolves to a collection of users.
   * @throws Will throw an error if users cannot be fetched.
   */
  async findAll(filters: UserFiltersDto): Promise<UserCollectionDto> {
    try {
      const userCollection = await this.usersRepository.findAll(filters);

      this.logger.log(
        `fetched ${userCollection.metadata.count} users with filters: ${JSON.stringify(filters)}`,
      );

      return userCollection;
    } catch (error) {
      this.handleError('fetch users', error);
    }
  }

  /**
   * Fetches a user by their unique identifier.
   *
   * @param {string} id - The unique identifier of the user to be fetched.
   * @returns {Promise<UserDataDto>} A promise that resolves to the user data transfer object.
   * @throws Will throw an error if the user cannot be fetched.
   */
  async findById(id: string): Promise<UserDataDto> {
    try {
      const user = await this.usersRepository.findById(id);

      this.logger.log(`fetched user with id ${id}`);

      return user;
    } catch (error) {
      this.handleError('fetch user by id', error);
    }
  }

  /**
   * Updates a user's details with the provided data.
   *
   * This method first checks if another user with the same email or username already exists.
   * If such a user exists, it throws a `BadRequestException`.
   * Otherwise, it updates the user and logs the update.
   *
   * @param {UpdateUserDto} data - The updated data for the user.
   * @returns {Promise<UserDataDto>} A promise that resolves to the updated user data transfer object.
   * @throws {BadRequestException} - If another user with the same email or username already exists.
   */
  async updateById(updateUserDto: UpdateUserDto): Promise<UserDataDto> {
    try {
      const filter: UserFiltersDto = {
        email: updateUserDto.email,
        username: updateUserDto.username,
      };

      const existingUserCollection = await this.usersRepository.findAll(filter);

      if (
        existingUserCollection.metadata.count &&
        existingUserCollection.users[0].id !== updateUserDto.id
      ) {
        throw new BadRequestException(
          `The email or username is already in use by another user`,
        );
      }
      
      const user = await this.usersRepository.updateById(updateUserDto);
      if (updateUserDto.role) {
        await this.usersRepository.updatePrivilegeById(updateUserDto.id);
      }

      this.logger.log(`updated user with id ${user.id}`);

      return user;
    } catch (error) {
      this.handleError('update user', error);
    }
  }

  /**
   * Changes a user's password by their unique identifier.
   *
   * @param {ChangePasswordDto} changePasswordDto - The change password data transfer object.
   * @returns {Promise<UserDataDto>} A promise that resolves to the updated user data transfer object.
   * @throws Will throw an error if the user's password cannot be changed.
   */
  async changePasswordById(
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserDataDto> {
    try {
      const user =
        await this.usersRepository.changePasswordById(changePasswordDto);

      this.logger.log(`changed password for user with id ${user.id}`);

      return user;
    } catch (error) {
      this.handleError('change password by id', error);
    }
  }

  /**
   * Deletes a user by their unique identifier.
   *
   * @param {string} id - The unique identifier of the user to be deleted.
   * @returns {Promise<UserDataDto>} A promise that resolves to the deleted user data transfer object.
   * @throws Will throw an error if the user cannot be deleted.
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const isDeleted = await this.usersRepository.deleteById(id);

      this.logger.log(`deleted user with id ${id}`);

      return isDeleted;
    } catch (error) {
      this.handleError('delete user by id', error);
    }
  }
}
