import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersController } from 'src/adapters/controllers/users.controller';
import { SupabaseUsersRepository } from 'src/adapters/db/users.supabase';
import { UsersService } from 'src/domain/ports/users.service';
import { UsersRepository } from 'src/domain/ports/users.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
