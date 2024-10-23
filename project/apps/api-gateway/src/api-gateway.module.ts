import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import { AuthController } from './auth/auth.controller';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
import { MatchingController } from './matching/matching.controller';
import { QuestionsController } from './questions/questions.controller';
import { UsersController } from './users/users.controller';
import { CollaborationController } from './collaboration/collaboration.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsedEnv = envSchema.safeParse(config);
        if (!parsedEnv.success) {
          console.error(
            '❌ Invalid environment variables:',
            parsedEnv.error.flatten().fieldErrors,
          );
          throw new Error('Invalid environment variables');
        }
        return parsedEnv.data;
      },
    }),
    EnvModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
      },
    }),
    ClientsModule.registerAsync([
      {
        imports: [EnvModule],
        name: 'QUESTION_SERVICE',
        useFactory: async (envService: EnvService) => ({
          transport: Transport.TCP,
          options: {
            host:
              envService.get('NODE_ENV') === 'development'
                ? 'localhost'
                : envService.get('QUESTION_SERVICE_HOST'),
            port: 3001,
          },
        }),
        inject: [EnvService],
      },
      {
        imports: [EnvModule],
        name: 'USER_SERVICE',
        useFactory: async (envService: EnvService) => ({
          transport: Transport.TCP,
          options: {
            host:
              envService.get('NODE_ENV') === 'development'
                ? 'localhost'
                : envService.get('USER_SERVICE_HOST'),
            port: 3002,
          },
        }),
        inject: [EnvService],
      },
      {
        imports: [EnvModule],
        name: 'AUTH_SERVICE',
        useFactory: async (envService: EnvService) => ({
          transport: Transport.TCP,
          options: {
            host:
              envService.get('NODE_ENV') === 'development'
                ? 'localhost'
                : envService.get('AUTH_SERVICE_HOST'),
            port: 3003,
          },
        }),
        inject: [EnvService],
      },
      {
        imports: [EnvModule],
        name: 'MATCHING_SERVICE',
        useFactory: async (envService: EnvService) => ({
          transport: Transport.TCP,
          options: {
            host:
              envService.get('NODE_ENV') === 'development'
                ? 'localhost'
                : envService.get('MATCHING_SERVICE_HOST'),
            port: 3004,
          },
        }),
        inject: [EnvService],
      },
      {
        imports: [EnvModule],
        name: 'COLLABORATION_SERVICE',
        useFactory: async (envService: EnvService) => ({
          transport: Transport.TCP,
          options: {
            host:
              envService.get('NODE_ENV') === 'development'
                ? 'localhost'
                : envService.get('COLLABORATION_SERVICE_HOST'),
            port: 3005,
          },
        }),
        inject: [EnvService],
      },
    ]),
  ],
  controllers: [
    QuestionsController,
    UsersController,
    AuthController,
    MatchingController,
    CollaborationController,
  ],
})
export class ApiGatewayModule {}
