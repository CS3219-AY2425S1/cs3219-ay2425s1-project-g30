import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from 'src/adapters/controllers/auth.controller';
import { SupabaseAuthRepository } from 'src/adapters/db/auth.supabase';
import { AuthService } from 'src/domain/ports/auth.service';
import { AuthRepository } from 'src/domain/ports/auth.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AuthRepository,
      useClass: SupabaseAuthRepository,
    },
  ],
})
export class AuthModule {}
