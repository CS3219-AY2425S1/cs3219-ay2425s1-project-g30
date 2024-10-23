import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('collaboration')
export class CollaborationController {
  constructor(
    @Inject('COLLABORATION_SERVICE')
    private readonly collaborationServiceClient: ClientProxy,
  ) {}

  // TODO: Add route handling methods
}
