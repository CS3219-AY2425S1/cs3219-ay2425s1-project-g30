import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersController } from 'src/adapters/controllers/users.controller';
import { SupabaseUsersRepository } from 'src/adapters/db/users.supabase';
import { UsersService } from 'src/domain/ports/users.service';
import { UsersRepository } from 'src/domain/ports/users.repository';
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
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: SupabaseUsersRepository,
    },
  ],
})
export class UsersModule {}
