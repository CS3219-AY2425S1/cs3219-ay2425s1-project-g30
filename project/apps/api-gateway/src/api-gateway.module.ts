import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QuestionsController } from './questions/questions.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { LoggerModule } from 'nestjs-pino';
import { MatchingController } from './matching/matching.controller';

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
    // Client for Questions Service
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
      {
        name: 'MATCHING_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'development'
              ? 'localhost'
              : process.env.MATCHING_SERVICE_HOST || 'localhost',
          port: 3004,
        },
      },
    ]),
  ],
  controllers: [QuestionsController, AuthController, MatchingController],
})
export class ApiGatewayModule {}
