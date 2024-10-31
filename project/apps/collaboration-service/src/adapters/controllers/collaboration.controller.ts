import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CollabRequestDto } from '@repo/dtos/collab';

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
  async createCollab(@Payload() collabData: CollabRequestDto) {
    return await this.collaborationService.createCollab(collabData);
  }

  @MessagePattern({ cmd: 'get_all_collabs' })
  async getAllCollabs(@Payload() userId: string) {
    return await this.collaborationService.getAllCollabs(userId);
  }

  @MessagePattern({ cmd: 'get_active_collabs' })
  async getCollab(@Payload() userId: string) {
    return await this.collaborationService.getActiveCollabs(userId);
  }

  @MessagePattern({ cmd: 'verify_collab' })
  async verifyCollab(@Payload() collabId: string) {
    return await this.collaborationService.verifyCollab(collabId);
  }

  @MessagePattern({ cmd: 'get_collab_info' })
  async getCollabInfo(@Payload() collabId: string) {
    return await this.collaborationService.getCollabInfo(collabId);
  }

  @MessagePattern({ cmd: 'end_collab' })
  async endCollab(@Payload() collabId: string) {
    return await this.collaborationService.endCollab(collabId);
  }
}
