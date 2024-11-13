import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { QuestionsController } from 'src/adapters/controllers/questions.controller';
import { QuestionsService } from 'src/domain/ports/questions.service';
import { QuestionsRepository } from 'src/domain/ports/questions.repository';
import { SupabaseQuestionsRepository } from 'src/adapters/db/questions.supabase';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';

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
  controllers: [QuestionsController],
  providers: [
    QuestionsService,
    {
      provide: QuestionsRepository,
      useClass: SupabaseQuestionsRepository,
    },
  ],
})
export class QuestionsModule {}
