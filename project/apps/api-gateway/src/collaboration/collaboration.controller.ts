import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';
import {
  collabFiltersSchema,
  CollabFiltersDto,
  activeCollabExistsSchema,
  ActiveCollabExistsDto,
} from '@repo/dtos/collab';
@Controller('collaboration')
export class CollaborationController {
  constructor(
    @Inject('COLLABORATION_SERVICE')
    private readonly collaborationServiceClient: ClientProxy,
  ) {}

  @Get('active-exists')
  @UsePipes(new ZodValidationPipe(activeCollabExistsSchema))
  async getActivieCollaborationExists(
    @Query() collabExistDto: ActiveCollabExistsDto,
  ) {
    return this.collaborationServiceClient.send(
      { cmd: 'check_active_collabs' },
      collabExistDto.user_id,
    );
  }

  @Get(':id')
  async getCollaborationInfoById(@Param('id') collabId: string) {
    return this.collaborationServiceClient.send(
      { cmd: 'get_collab_info' },
      collabId,
    );
  }

  @Get('history/:id')
  async getCollaborationHistoryById(@Param('id') collabId: string) {
    return this.collaborationServiceClient.send(
      { cmd: 'get_collab_history' },
      collabId,
    );
  }

  @Get()
  @UsePipes(new ZodValidationPipe(collabFiltersSchema))
  async getCollaborationInfos(@Query() filters: CollabFiltersDto) {
    return this.collaborationServiceClient.send(
      { cmd: 'get_all_collabs' },
      filters,
    );
  }

  @Get('verify/:id')
  async verifyCollaboration(@Param('id') collabId: string) {
    return this.collaborationServiceClient.send(
      { cmd: 'verify_collab' },
      collabId,
    );
  }

  @Post('end/:id')
  async endCollaboration(@Param('id') collabId: string) {
    return this.collaborationServiceClient.send(
      { cmd: 'end_collab' },
      collabId,
    );
  }
}
