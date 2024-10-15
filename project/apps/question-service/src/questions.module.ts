import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { QuestionsController } from 'src/adapters/controllers/questions.controller';
import { QuestionsService } from 'src/domain/ports/questions.service';
import { QuestionsRepository } from 'src/domain/ports/questions.repository';
import { SupabaseQuestionsRepository } from 'src/adapters/db/questions.supabase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
