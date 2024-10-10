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
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './constants/redis';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync(RedisOptions),
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
    ]),
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
