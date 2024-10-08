import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import {
  UserAuthRecordDto,
  UserDataDto,
  UserSessionDto,
} from '@repo/dtos/users';
import {
  createClient,
  SignInWithPasswordCredentials,
  SupabaseClient,
} from '@supabase/supabase-js';
import { UsersRepository } from 'src/domain/ports/users.repository';

@Injectable()
export class SupabaseUsersRepository implements UsersRepository {
  private supabase: SupabaseClient;

  private readonly PROFILES_TABLE = 'profiles';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

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

    return data.user as UserAuthRecordDto;
  }

  async getUserDataById(id: string): Promise<UserDataDto> {
    const { data, error } = await this.supabase
      .from(this.PROFILES_TABLE)
      .select(`id, email, username`)
      .eq('id', id)
      .single<UserDataDto>();

    if (error) {
      throw new BadRequestException(error.message);
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
      throw new BadRequestException(authError.message);
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
      throw new BadRequestException(profileError.message);
    }

    return { userData: profileData, session } as UserSessionDto;
  }

  async signIn(signInDto: SignInDto): Promise<UserSessionDto> {
    const { email, password } = signInDto;

    const credentials = { email, password } as SignInWithPasswordCredentials;
    const { data, error } =
      await this.supabase.auth.signInWithPassword(credentials);

    if (error) {
      throw new BadRequestException(error.message);
    }

    const { user, session } = data;
    if (!user || !session) {
      throw new BadRequestException('Unexpected sign-in response');
    }

    const userData = await this.getUserDataById(user.id);

    return { userData, session } as UserSessionDto;
  }
}