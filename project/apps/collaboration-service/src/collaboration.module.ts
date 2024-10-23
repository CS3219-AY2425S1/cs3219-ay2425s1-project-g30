import { Module } from '@nestjs/common';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';

@Module({
  imports: [],
  controllers: [CollaborationController],
  providers: [CollaborationService],
})
export class CollaborationModule {}
