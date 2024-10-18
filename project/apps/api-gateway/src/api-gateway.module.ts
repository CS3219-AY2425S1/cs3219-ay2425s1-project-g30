import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { EnvService } from './env/env.service';
import { QuestionsController } from './questions/questions.controller';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { MatchingController } from './matching/matching.controller';
import { envSchema } from './env/env';
import { EnvModule } from '../../user-service/src/domain/env/env.module';

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
