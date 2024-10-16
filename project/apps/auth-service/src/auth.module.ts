import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from 'src/adapters/controllers/auth.controller';
import { SupabaseAuthRepository } from 'src/adapters/db/auth.supabase';
import { AuthService } from 'src/domain/ports/auth.service';
import { AuthRepository } from 'src/domain/ports/auth.repository';
import { envSchema } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsedEnv = envSchema.safeParse(config);
        if (!parsedEnv.success) {
          console.error(
            '❌ Invalid environment variables:',
            parsedEnv.error.format(),
          );
          throw new Error('Invalid environment variables');
        }
        return parsedEnv.data;
      },
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
