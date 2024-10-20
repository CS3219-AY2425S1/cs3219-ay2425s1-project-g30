import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MatchRedis } from './db/match.redis';
import { MatchSupabase } from './db/match.supabase';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
import { MatchCancelService } from './matchCancel/matchCancel.service';
import { MatchEngineConsumer } from './matchEngine/matchEngine.consumeRequest';
import { MatchExpiryProducer } from './matchEngine/matchEngine.produceExpiry';
import { MatchEngineService } from './matchEngine/matchEngine.service';
import { MatchExpiryConsumer } from './matchExpiry/matchExpiry.consumeExpiry';
import { MatchExpiryService } from './matchExpiry/matchExpiry.service';
import { MatchingController } from './matching.controller';
import { MatchRequestService } from './matchRequest/matchRequest.service';
import { MatchingGateway } from './matching.gateway';
import { RedisModule } from './redis/redis.module';
import { MatchService } from './matching.service';

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
    RedisModule,
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
    MatchService,
    MatchingGateway,
  ],
  exports: [],
})
export class MatchingModule {}
