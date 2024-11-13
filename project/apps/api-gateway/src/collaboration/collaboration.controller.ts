import {
  Body,
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
  executionSnapshotCreateSchema,
  ExecutionSnapshotDto,
  collabUpdateLanguageDto,
  collabUpdateLanguageSchema,
} from '@repo/dtos/collab';
import { AttemptFiltersDto, attemptFiltersSchema } from '@repo/dtos/attempt';
@Controller('collaboration')
export class CollaborationController {
  constructor(
    @Inject('COLLABORATION_SERVICE')
    private readonly collaborationServiceClient: ClientProxy,
  ) {}

  @Get('active-exists')
  @UsePipes(new ZodValidationPipe(activeCollabExistsSchema))
  async getActiveCollaborationExists(
    @Query() collabExistDto: ActiveCollabExistsDto,
  ) {
    return this.collaborationServiceClient.send(
      { cmd: 'check_active_collabs' },
      collabExistDto.user_id,
    );
  }

  // needs to be placed before :id to avoid ambiguity
  @Get('attempts')
  @UsePipes(new ZodValidationPipe(attemptFiltersSchema))
  async getAttempts(@Query() filters: AttemptFiltersDto) {
    return this.collaborationServiceClient.send(
      { cmd: 'get_attempts' },
      filters,
    );
  }

  @Get(':id')
  async getCollaborationInfoById(@Param('id') collabId: string) {
    return this.collaborationServiceClient.send(
      { cmd: 'get_collab_info' },
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

  @Post('language')
  @UsePipes(new ZodValidationPipe(collabUpdateLanguageSchema))
  async updateCollaborationLanguage(
    @Body() collabUpdateLanguage: collabUpdateLanguageDto,
  ) {
    return this.collaborationServiceClient.send(
      { cmd: 'update_collab_language' },
      collabUpdateLanguage,
    );
  }

  @Post('end/:id')
  async endCollaboration(@Param('id') collabId: string) {
    return this.collaborationServiceClient.send(
      { cmd: 'end_collab' },
      collabId,
    );
  }

  @Post('snapshot')
  @UsePipes(new ZodValidationPipe(executionSnapshotCreateSchema))
  async createExecutionSnapshot(@Body() snapshot: ExecutionSnapshotDto) {
    return this.collaborationServiceClient.send(
      { cmd: 'create_snapshot' },
      snapshot,
    );
  }
}
