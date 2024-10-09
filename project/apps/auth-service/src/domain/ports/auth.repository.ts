import {
  UserAuthRecordDto,
  UserDataDto,
  UserSessionDto,
} from '@repo/dtos/users';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';

/**
 * Abstract class representing the AuthRepository.
 * This class defines the methods for interacting with user data and authentication records.
 */
export abstract class AuthRepository {
  /**
   * Retrieves a user authentication record by token.
   *
   * @param token - The token associated with the user authentication record.
   * @returns A promise that resolves to the UserAuthRecord.
   */
  abstract getUserAuthRecordByToken(token: string): Promise<UserAuthRecordDto>;

  /**
   * Retrieves user data by user ID.
   *
   * @param id - The ID of the user.
   * @returns A promise that resolves to the UserDataDto.
   */
  abstract getUserDataById(id: string): Promise<UserDataDto>;

  /**
   * Signs up a new user.
   *
   * @param user - The data transfer object containing user sign-up information.
   * @returns A promise that resolves to the UserSessionDto.
   */
  abstract signUp(user: SignUpDto): Promise<UserSessionDto>;

  /**
   * Signs in an existing user.
   *
   * @param signInDto - The data transfer object containing user sign-in information.
   * @returns A promise that resolves to the UserSessionDto.
   */
  abstract signIn(signInDto: SignInDto): Promise<UserSessionDto>;
}
