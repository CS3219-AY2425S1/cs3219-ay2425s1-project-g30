import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CollaborationController } from 'src/adapters/controllers/collaboration.controller';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from 'src/domain/ports/collaboration.service';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { CollaborationRepository } from './domain/ports/collaboration.repository';
import { CollaborationSupabase } from './adapters/db/collaboration.supabase';

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
  ],
  controllers: [CollaborationController],
  providers: [
    CollaborationService,
    CollaborationGateway,
    { provide: CollaborationRepository, useClass: CollaborationSupabase },
  ],
})
export class CollaborationModule {}
