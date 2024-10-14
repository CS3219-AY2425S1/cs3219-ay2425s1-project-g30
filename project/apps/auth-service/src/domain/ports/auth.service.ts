import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';

import {
  UserDataDto,
  UserSessionDto,
  UserAuthRecordDto,
} from '@repo/dtos/users';
import { AuthRepository } from './auth.repository';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authRepository: AuthRepository) {}

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
        await this.authRepository.getUserAuthRecordByToken(token);

      this.logger.log(
        `user with id ${userAuthRecord.id} verified successfully`,
      );

      return userAuthRecord;
    } catch (error) {
      this.handleError('verify user', new UnauthorizedException(error.message));
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
        await this.authRepository.getUserAuthRecordByToken(token);

      const userData = await this.authRepository.getUserDataById(
        userAuthRecord.id,
      );

      this.logger.log(`user with id ${userData.id} fetched successfully`);

      return userData;
    } catch (error) {
      this.handleError('fetch me', new BadRequestException(error.message));
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
      const userSession = await this.authRepository.signUp(signUpDto);

      this.logger.log(
        `user with id ${userSession.userData.id} signed up successfully`,
      );

      return userSession;
    } catch (error) {
      this.handleError('sign up', new BadRequestException(error.message));
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
      const userSession = await this.authRepository.signIn(signInDto);

      this.logger.log(
        `user with id ${userSession.userData.id} signed in successfully`,
      );

      return userSession;
    } catch (error) {
      this.handleError('sign in', new BadRequestException(error.message));
    }
  }
}
