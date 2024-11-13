import {
  UserAuthRecordDto,
  UserDataDto,
  UserSessionDto,
} from '@repo/dtos/users';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { Session } from '@supabase/supabase-js';

/**
 * Abstract class representing the AuthRepository.
 * This class defines the methods for interacting with user data and authentication records.
 */
export abstract class AuthRepository {
  /**
   * Retrieves a user authentication record by token.
   *
   * @param accessToken - The token associated with the user authentication record.
   * @returns A promise that resolves to the UserAuthRecord.
   */
  abstract getUserAuthRecordByToken(
    accessToken: string,
  ): Promise<UserAuthRecordDto>;

  /**
   * Refreshes the user session.
   *
   * @param refreshToken - The refresh token used to refresh the user session.
   * @returns A promise that resolves to a Session.
   */
  abstract refreshUserSession(refreshToken: string): Promise<Session>;

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

  /**
   * Signs out the user.
   *
   * @returns A promise that resolves to void.
   */
  abstract signOut(): Promise<Session>;
}
