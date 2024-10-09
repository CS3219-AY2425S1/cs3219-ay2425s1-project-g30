import { Module } from '@nestjs/common';
import { MatchingController } from './adapters/controllers/matching.controller';
import { MatchProducer } from './domain/ports/match.producer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MatchConsumer } from './domain/consumer/match.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MatchingController],
  providers: [MatchProducer, MatchConsumer],
})
export class MatchingModule {}
