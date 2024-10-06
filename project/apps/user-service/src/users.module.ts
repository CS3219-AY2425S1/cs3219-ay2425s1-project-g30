import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from 'src/adapters/controllers/auth.controller';
import { SupabaseUsersRepository } from 'src/adapters/db/users.supabase';
import { AuthService } from 'src/domain/ports/auth.service';
import { UsersRepository } from 'src/domain/ports/users.repository';

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
      provide: UsersRepository,
      useClass: SupabaseUsersRepository,
    },
  ],
})
export class UserModule {}
