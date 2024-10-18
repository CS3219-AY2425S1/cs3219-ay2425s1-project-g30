import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { EnvModule } from 'src/env/env.module';
import { EnvService } from 'src/env/env.service';
import { redisStore } from 'cache-manager-redis-store';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [EnvModule],
  useFactory: async (envService: EnvService) => {
    const store = await redisStore({
      socket: {
        host: envService.get('REDIS_HOST'),
        port: envService.get('REDIS_PORT'),
      },
    });
    return {
      store: () => store,
    };
  },
  inject: [EnvService],
};

export const MATCH_WAITING_KEY = 'match-waiting';
export const MATCH_CANCELLED_KEY = 'match-cancelled';
export const SOCKET_USER_KEY = 'socket-user';
export const USER_SOCKET_KEY = 'user-socket';
