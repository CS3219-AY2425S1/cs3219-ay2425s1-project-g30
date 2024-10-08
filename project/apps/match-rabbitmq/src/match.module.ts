import { Module } from '@nestjs/common';
import { MatchController } from './adapters/controllers/match.controller';
import { MatchConsumer } from './domain/ports/match.consumer';

@Module({
  imports: [],
  controllers: [MatchController],
  providers: [MatchConsumer],
})
export class MatchModule {}
