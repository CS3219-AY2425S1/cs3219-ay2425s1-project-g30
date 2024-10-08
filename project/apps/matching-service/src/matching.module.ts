import { Module } from '@nestjs/common';
import { MatchingController } from './adapters/controllers/matching.controller';
import { MatchingService } from './domain/ports/matching.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // register async to use environment variables
    ClientsModule.registerAsync([
      {
        name: 'MATCH_QUEUE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ||
                'amqp://localhost:5672',
            ],
            queue: 'match_queue',
            queueOptions: {
              durable: true,
              autoDelete: true,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'MATCH_EXPIRY_QUEUE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ||
                'amqp://localhost:5672',
            ],
            queue: 'match_expiry_queue',
            queueOptions: {
              durable: true,
              autoDelete: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
