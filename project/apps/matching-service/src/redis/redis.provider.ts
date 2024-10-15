import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const RedisClientProvider: Provider = {
    provide: 'REDIS_CLIENT',
    useFactory: (configService: ConfigService): Redis => {
      const client = new Redis({
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: parseInt(configService.get<string>('REDIS_PORT')!, 10) || 6379,
        db: parseInt(configService.get<string>('REDIS_DB')!, 10) || 0,
      });

      client.on('error', (err) => {
        console.error('Redis error:', err);
      });

        return client;
    },
    inject: [ConfigService],
  };