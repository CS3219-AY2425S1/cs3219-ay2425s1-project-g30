import { Module, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/constants/redis';
import { EnvModule } from 'src/env/env.module';
import { EnvService } from 'src/env/env.service';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (envService: EnvService): Redis => {
        const client = new Redis({
          host: envService.get('REDIS_HOST'),
          port: envService.get('REDIS_PORT'),
        });

        client.on('error', (err) => {
          Logger.error(`Redis error: ${err.message}`, '', 'RedisModule');
        });
        return client;
      },
      inject: [EnvService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
