import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import {
  UserAuthRecordDto,
  UserDataDto,
  UserSessionDto,
} from '@repo/dtos/users';
import {
  createClient,
  Session,
  SignInWithPasswordCredentials,
  SupabaseClient,
} from '@supabase/supabase-js';
import { AuthRepository } from '../../domain/ports/auth.repository';

@Injectable()
export class SupabaseAuthRepository implements AuthRepository {
  private supabase: SupabaseClient;

  private readonly PROFILES_TABLE = 'profiles';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getUserAuthRecordByToken(token: string): Promise<UserAuthRecordDto> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Access user's role
    const { data: userData, error: userError } = await this.supabase
      .from(this.PROFILES_TABLE)
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      throw new BadRequestException("Trouble accessing user's data");
    }

    data.user.role = userData.role;
    return data.user as UserAuthRecordDto;
  }

  async refreshUserSession(refreshToken: string): Promise<Session> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error('Invalid token');
    }

    return data.session;
  }

  async getUserDataById(id: string): Promise<UserDataDto> {
    const { data, error } = await this.supabase
      .from(this.PROFILES_TABLE)
      .select()
      .eq('id', id)
      .single<UserDataDto>();

    if (error) {
      throw error;
    }

    return data;
  }

  async signUp(signUpDto: SignUpDto): Promise<UserSessionDto> {
    const { email, password, username } = signUpDto;

    // First, create user in Supabase Auth
    const { data: authData, error: authError } =
      await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

    if (authError) {
      throw authError;
    }

    const { user, session } = authData;

    if (!user || !session) {
      throw new BadRequestException('Unexpected sign-up response');
    }

    // Next, create user profile in Supabase Profiles table
    const { data: profileData, error: profileError } = await this.supabase
      .from(this.PROFILES_TABLE)
      .insert({
        id: user.id,
        email,
        username,
      })
      .select()
      .single<UserDataDto>();

    if (profileError) {
      // Rollback user creation in Auth
      await this.supabase.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    return { userData: profileData, session } as UserSessionDto;
  }

  async signIn(signInDto: SignInDto): Promise<UserSessionDto> {
    const { email, password } = signInDto;

    const credentials = { email, password } as SignInWithPasswordCredentials;
    const { data, error } =
      await this.supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw error;
    }

    const { user, session } = data;
    if (!user || !session) {
      throw new BadRequestException('Unexpected sign-in response');
    }

    const userData = await this.getUserDataById(user.id);

    return { userData, session } as UserSessionDto;
  }

  async signOut(): Promise<Session> {
    const { data, error } = await this.supabase.auth.getSession();

    if (!data.session) throw new Error('No active session');
    else if (error) throw error;

    const { error: authError } = await this.supabase.auth.signOut();
    if (authError) {
      throw authError;
    }
    return data.session;
  }
}
