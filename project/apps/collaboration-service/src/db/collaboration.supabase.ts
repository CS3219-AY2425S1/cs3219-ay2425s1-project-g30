import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvService } from 'src/env/env.service';
// import { firstValueFrom } from 'rxjs';
// import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CollaborationSupabase {
  private supabase: SupabaseClient;

  private readonly COLLABORATION_TABLE = 'collaboration';

  constructor(private envService: EnvService) {
    const supabaseUrl = this.envService.get('SUPABASE_URL');
    const supabaseKey = this.envService.get('SUPABASE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
}
