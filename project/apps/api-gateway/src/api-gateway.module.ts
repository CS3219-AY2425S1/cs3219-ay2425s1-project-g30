import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QuestionsController } from './questions/questions.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { LoggerModule } from 'nestjs-pino';
import { UsersController } from './users/users.controller';
import { AuthService } from './auth/auth.service';
import { AuthRepository } from './auth/auth.repository';
import { SupabaseAuthRepository } from './auth/auth.supabase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
      },
    }),
    ClientsModule.register([
      {
        name: 'QUESTION_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'development'
              ? 'localhost'
              : process.env.QUESTION_SERVICE_HOST || 'localhost',
          port: 3001,
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'development'
              ? 'localhost'
              : process.env.USER_SERVICE_HOST || 'localhost',
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [AuthController, QuestionsController, UsersController],
  providers: [
    AuthService,
    {
      provide: AuthRepository,
      useClass: SupabaseAuthRepository,
    },
  ],
})
export class ApiGatewayModule {}
