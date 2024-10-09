import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchingController } from './adapters/controllers/matching.controller';
import { MatchExpiryConsumer } from './domain/ports/consumers/match-expiry.consumer';
import { MatchConsumer } from './domain/ports/consumers/match.consumer';
import { MatchExpiryProducer } from './domain/ports/producers/match-expiry.producer';
import { MatchProducer } from './domain/ports/producers/match.producer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MatchingController],
  providers: [
    MatchProducer,
    MatchConsumer,
    MatchExpiryProducer,
    MatchExpiryConsumer,
  ],
})
export class MatchingModule {}
