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

  // Refer to questions.supabase.ts for examples
}
