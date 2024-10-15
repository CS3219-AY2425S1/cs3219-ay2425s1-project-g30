import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis  from 'ioredis';
import redisStore from 'cache-manager-ioredis';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<CacheModuleOptions> => {
        const redisClient = new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get<string>('REDIS_PORT')!, 10) || 6379,
          db: parseInt(configService.get<string>('REDIS_DB')!, 10) || 0,
        });

        return {
          store: redisStore,
          redisInstance: redisClient,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'redisClient',
      useFactory: async (configService: ConfigService): Promise<Redis> => {
        const client = new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get<string>('REDIS_PORT')!, 10) || 6379,
          db: parseInt(configService.get<string>('REDIS_DB')!, 10) || 0,
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheModule, 'redisClient'],
})
export class RedisModule {}
