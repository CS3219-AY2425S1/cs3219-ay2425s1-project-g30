import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: parseInt(configService.get<string>('REDIS_PORT')!) || 6379,
      },
    });
    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};

export const MATCH_WAITING_KEY = 'match-waiting';
export const MATCH_CANCELLED_KEY = 'match-cancelled';
