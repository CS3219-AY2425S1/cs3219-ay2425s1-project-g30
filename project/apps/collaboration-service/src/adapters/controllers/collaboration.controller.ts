import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CollabCreateDto } from '@repo/dtos/collab';

import { CollaborationService } from 'src/domain/ports/collaboration.service';

@Controller()
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  /**
   * Called by the matching-service to create a new collaboration.
   * @param collabData
   * @returns
   */
  @MessagePattern({ cmd: 'create_collab' })
  async createCollab(@Payload() collabData: CollabCreateDto) {
    return await this.collaborationService.createCollab(collabData);
  }

  @MessagePattern({ cmd: 'get_active_collab' })
  async getCollab(@Payload() userId: string) {
    return await this.collaborationService.getActiveCollab(userId);
  }

  @MessagePattern({ cmd: 'verify_collab' })
  async verifyCollab(@Payload() collabId: string) {
    return await this.collaborationService.verifyCollab(collabId);
  }

  // @MessagePattern({ cmd: 'end_collab' })
  // async endCollab(@Payload() collabId: string) {
  //   return await this.collaborationService.endCollab(collabId);
  // }
}
