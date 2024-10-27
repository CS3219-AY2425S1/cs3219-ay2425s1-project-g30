import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CollaborationController } from './collaboration.controller';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { CollaborationRedis } from './db/collaboration.redis';
import { RedisModule } from 'redis/redis.module';

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
  ],
  controllers: [CollaborationController],
  providers: [CollaborationService, CollaborationGateway, CollaborationRedis],
})
export class CollaborationModule {}
