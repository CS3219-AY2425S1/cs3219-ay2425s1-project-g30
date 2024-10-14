import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MatchSupabase {
  private supabase: SupabaseClient;

  private readonly MATCHES_TABLE = 'matches';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
}
