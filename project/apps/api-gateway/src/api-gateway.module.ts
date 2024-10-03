import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QuestionsController } from './questions/questions.controller';
import { SupabaseService } from './supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { LoggerModule } from 'nestjs-pino';

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
          host: process.env.QUESTION_SERVICE_HOST || 'question-service',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [QuestionsController, AuthController],
  providers: [SupabaseService, AuthService],
})
export class ApiGatewayModule {}
