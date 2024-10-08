import { Injectable, Logger } from '@nestjs/common';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { RpcException } from '@nestjs/microservices';
import { UsersRepository } from 'src/domain/ports/users.repository';
import {
  UserDataDto,
  UserSessionDto,
  UserAuthRecordDto,
} from '@repo/dtos/users';

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
   * Verifies a user based on the provided token.
   *
   * @param token - The token used to verify the user.
   * @returns A promise that resolves to a UserAuthRecord if the verification is successful.
   * @throws Will handle and log errors if the verification process fails.
   */
  async verifyUser(token: string): Promise<UserAuthRecordDto> {
    try {
      const userAuthRecord =
        await this.usersRepository.getUserAuthRecordByToken(token);

      this.logger.log(
        `user with id ${userAuthRecord.id} verified successfully`,
      );

      return userAuthRecord;
    } catch (error) {
      this.handleError('verify user', error);
    }
  }

  /**
   * Retrieves the user data associated with the provided authentication token.
   *
   * @param token - The authentication token used to identify the user.
   * @returns A promise that resolves to the user's data.
   * @throws Will handle and log any errors that occur during the process.
   */
  async me(token: string): Promise<UserDataDto> {
    try {
      const userAuthRecord =
        await this.usersRepository.getUserAuthRecordByToken(token);

      const userData = await this.usersRepository.getUserDataById(
        userAuthRecord.id,
      );

      return userData;
    } catch (error) {
      this.handleError('fetch me', error);
    }
  }

  /**
   * Signs up a new user using the provided sign-up data transfer object (DTO).
   *
   * @param signUpDto - The data transfer object containing the user's sign-up information.
   * @returns A promise that resolves to a UserSessionDto containing the user's session information.
   * @throws Will handle and log any errors that occur during the sign-up process.
   */
  async signUp(signUpDto: SignUpDto): Promise<UserSessionDto> {
    try {
      const userSession = await this.usersRepository.signUp(signUpDto);

      this.logger.log(
        `user with id ${userSession.userData.id} signed up successfully`,
      );

      return userSession;
    } catch (error) {
      this.handleError('sign up', error);
    }
  }

  /**
   * Signs in a user with the provided credentials.
   *
   * @param signInDto - The data transfer object containing the user's sign-in credentials.
   * @returns A promise that resolves to a UserSessionDto containing the user's session information.
   * @throws Will throw an error if the sign-in process fails.
   */
  async signIn(signInDto: SignInDto): Promise<UserSessionDto> {
    try {
      const userSession = await this.usersRepository.signIn(signInDto);

      this.logger.log(
        `user with id ${userSession.userData.id} signed in successfully`,
      );

      return userSession;
    } catch (error) {
      this.handleError('sign in', error);
    }
  }
}