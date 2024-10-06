import { Module } from '@nestjs/common';
import { AuthController } from './adapters/controllers/auth.controller';
import { AuthService } from './domain/ports/auth.service';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from './domain/ports/users.repository';
import { SupabaseUsersRepository } from './adapters/db/users.supabase';

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
