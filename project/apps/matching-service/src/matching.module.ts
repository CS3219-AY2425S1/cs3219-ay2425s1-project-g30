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
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './constants/redis';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MatchingGateway } from './matching.gateway';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
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
    CacheModule.registerAsync(RedisOptions),
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
    MatchingGateway,
  ],
})
export class MatchingModule {}
