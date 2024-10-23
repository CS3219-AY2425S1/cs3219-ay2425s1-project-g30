import { Controller } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';

@Controller()
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}
}
