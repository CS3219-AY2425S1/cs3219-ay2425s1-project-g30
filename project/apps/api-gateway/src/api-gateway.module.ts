import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuestionsController } from './questions/questions.controller';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { MatchingController } from './matching/matching.controller';
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
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
      },
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'QUESTION_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('NODE_ENV') === 'development'
                ? 'localhost'
                : configService.get<string>('QUESTION_SERVICE_HOST'),
            port: 3001,
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'USER_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('NODE_ENV') === 'development'
                ? 'localhost'
                : configService.get<string>('USER_SERVICE_HOST'),
            port: 3002,
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'AUTH_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('NODE_ENV') === 'development'
                ? 'localhost'
                : configService.get<string>('AUTH_SERVICE_HOST'),
            port: 3003,
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'MATCHING_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get<string>('NODE_ENV') === 'development'
                ? 'localhost'
                : configService.get<string>('MATCHING_SERVICE_HOST'),
            port: 3004,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    QuestionsController,
    UsersController,
    AuthController,
    MatchingController,
  ],
})
export class ApiGatewayModule {}
