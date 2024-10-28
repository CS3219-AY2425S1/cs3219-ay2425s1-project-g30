import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('collaboration')
export class CollaborationController {
  constructor(
    @Inject('COLLABORATION_SERVICE')
    private readonly collaborationServiceClient: ClientProxy,
  ) {}

  @Get('get/:id')
  async getCollaborationInfoById(@Param('id') id: string) {
    return this.collaborationServiceClient.send({ cmd: 'get_collab_info' }, id);
  }
}
