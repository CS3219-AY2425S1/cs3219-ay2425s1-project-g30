import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MatchingGateway } from './matching.gateway'
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-ioredis';
import Redis from 'ioredis';
import { RedisModule } from './redis/redis.module';
import { REDIS_CLIENT } from './constants/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    CacheModule.registerAsync({
      imports: [RedisModule],
      useFactory: async (redisClient: Redis) => ({
        store: redisStore,
        redisInstance: redisClient,
      }),
      inject: [REDIS_CLIENT],
    }),
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
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            process.env.NODE_ENV === 'development'
              ? 'localhost'
              : process.env.AUTH_SERVICE_HOST || 'localhost',
          port: 3003,
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
    MatchingGateway
  ],
  exports: [],
})
export class MatchingModule {}
