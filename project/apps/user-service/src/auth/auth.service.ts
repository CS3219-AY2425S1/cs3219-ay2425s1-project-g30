import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Session } from '@supabase/supabase-js';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { UserDetails } from 'src/supabase/collection';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly supabaseService: SupabaseService) {}
  private readonly PROFILES_TABLE = 'profiles';

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

  async verifyUser(accessToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(accessToken);

    if (error || !data) {
      this.handleError(
        'verify user',
        new UnauthorizedException('Invalid token'),
      );
    }
    return data;
  }
  
  async refreshToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      this.handleError(
        'refresh token',
        new BadRequestException('Unexpected refresh token response.')
      );
    }
    
    return { newAccessToken: data.access_token, newRefreshToken: data.refresh_token };
  }


  async me(token: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error) {
      this.handleError('fetch me', new UnauthorizedException(error.message));
    }
    const { user } = data;
    if (!user || !data) {
      this.handleError(
        'fetch me',
        new BadRequestException('Unexpected sign-in response.'),
      );
    }
    const { data: userData, error: profileError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select(`id, email, username`)
      .eq('id', user.id)
      .returns<UserDetails[]>()
      .single();
    if (profileError) {
      this.handleError(
        'fetch me',
        new BadRequestException(profileError.message),
      );
    }
    return { userData };
  }

  async signUp(signUpDto: SignUpDto): Promise<{ userData: UserDetails; session: Session }> {
    const { email, password, username } = signUpDto;

    // Step 1: Create user in Supabase Auth
    const { data, error } = await this.supabaseService.getClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) {
      this.handleError('sign up', new BadRequestException(error.message));
    }
    const { user, session } = data;

    if (!user || !session) {
      this.handleError(
        'sign up',
        new BadRequestException('Unexpected error occured'),
      );
    }

    // Step 2: Insert profile data into profiles table
    const { data: userData, error: profileError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .insert({
        id: user.id,
        username,
        email,
      })
      .select()
      .single<UserDetails>();

    if (profileError) {
      // Delete the created user if profile creation fails
      await this.supabaseService.getClient().auth.admin.deleteUser(user.id);
      this.handleError(
        'fetch user data when signing up',
        new BadRequestException(profileError.message),
      );
    }

    // Return user and session information
    return { userData, session };
  }

  async signIn(signInDto: SignInDto): Promise<{ userData: UserDetails; session: Session }> {
    const { email, password } = signInDto;
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error) {
      this.handleError('sign in', new BadRequestException(error.message));
    }
    const { user, session } = data;
    if (!user || !data) {
      this.handleError(
        'sign in',
        new BadRequestException('Unexpected sign-in response.'),
      );
    }

    const { data: userData, error: profileError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select(`id, email, username`)
      .eq('id', user.id)
      .single<UserDetails>();

    if (profileError) {
      this.handleError(
        'fetch user data when signing in',
        new BadRequestException(profileError.message),
      );
    }

    return { userData, session };
  }
}
