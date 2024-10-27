import { Injectable, Logger } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';

import { CollabCreateDto } from '@repo/dtos/collab';

import { v4 as uuidv4 } from 'uuid';

import { CollaborationRedis } from './db/collaboration.redis';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(private readonly redisClient: CollaborationRedis) {}

  async createCollab(collabData: CollabCreateDto) {
    this.logger.debug(`Creating collaboration: ${JSON.stringify(collabData)}`);

    const room_id = uuidv4();

    // add collaboration to redis
    await this.redisClient.addCollab(collabData, room_id);
  }

  async getCollab(userId: string) {
    this.logger.debug(`Getting collaboration for user: ${userId}`);
    // fetch collaboration from redis
    // fetch questions from question service
    throw new Error('Method not implemented.');
  }

  async verifyCollab(collabId: string) {
    this.logger.debug(`Verifying collaboration: ${collabId}`);
    // fetch collaboration from redis
    throw new Error('Method not implemented.');
  }

  // not included in the diagrams yet, need to think about how to implement this
  async endCollab(collabId: string) {
    this.logger.debug(`Ending collaboration: ${collabId}`);
    // delete collaboration from redis
    throw new Error('Method not implemented.');
  }
}
