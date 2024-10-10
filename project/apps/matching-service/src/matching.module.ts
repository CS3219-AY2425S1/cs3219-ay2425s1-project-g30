import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatchingController } from './matching.controller';
import { MatchExpiryConsumer } from './matchExpiry/matchExpiry.consumeExpiry';
import { MatchExpiryProducer } from './matchEngine/matchEngine.produceExpiry';
import { MatchRedis } from './db/match.redis';
import { MatchSupabase } from './db/match.supabase';
import { MatchCancelService } from './matchCancel/matchCancel.service';
import { MatchEngineConsumer } from './matchEngine/matchEngine.consumeRequest';
import { MatchEngineService } from './matchEngine/matchEngine.service';
import { MatchExpiryService } from './matchExpiry/matchExpiry.service';
import { MatchRequestService } from './matchRequest/matchRequest.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MatchingController],
  providers: [
    MatchRedis,
    MatchSupabase,
    MatchCancelService,
    MatchEngineConsumer,
    MatchExpiryProducer,
    MatchEngineService,
    MatchExpiryConsumer,
    MatchExpiryService,
    MatchRequestService,
  ],
})
export class MatchingModule {}
