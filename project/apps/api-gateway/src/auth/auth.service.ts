// src/auth/auth.service.ts

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { UserDetails } from 'src/supabase/collection';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}
  private readonly PROFILES_TABLE = 'profiles';

  async me(token: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error) {
      throw new UnauthorizedException(error.message);
    }
    const { user } = data;
    if (!user || !data) {
      throw new BadRequestException('Unexpected sign-in response.');
    }
    const { data: userData, error: profileError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select(`id, email, username`)
      .eq('id', user.id)
      .returns<UserDetails[]>()
      .single();
    if (profileError) {
      throw new BadRequestException(profileError.message);
    }
    return { userData };
  }

  async signUp(signUpDto: SignUpDto) {
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
      throw new BadRequestException(error.message);
    }
    const { user, session } = data;

    if (!user || !session) {
      throw new BadRequestException('Unexpected error occured');
    }

    // Step 2: Insert profile data into profiles table
    const { data: userData, error: profileError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .insert([
        {
          id: user.id,
          username,
          email,
        },
      ])
      .returns<UserDetails[]>()
      .single();

    if (profileError) {
      // Delete the created user if profile creation fails
      await this.supabaseService.getClient().auth.admin.deleteUser(user.id);
      throw new BadRequestException(profileError.message);
    }

    // Return user and session information
    return { userData, session };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email, password });

    if (error) {
      throw new BadRequestException(error.message);
    }
    const { user, session } = data;
    if (!user || !data) {
      throw new BadRequestException('Unexpected sign-in response.');
    }

    const { data: userData, error: profileError } = await this.supabaseService
      .getClient()
      .from(this.PROFILES_TABLE)
      .select(`id, email, username`)
      .eq('id', user.id)
      .returns<UserDetails[]>()
      .single();

    if (profileError) {
      throw new BadRequestException(profileError.message);
    }

    return { userData, session };
  }
}
