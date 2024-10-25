import { Inject, Injectable, Logger } from '@nestjs/common';
import { CollabCreateDto, CollabRoomDto } from '@repo/dtos/collab';
import Redis from 'ioredis';
import { REDIS_CLIENT, USER_ROOM_KEY } from 'src/constants/redis';

@Injectable()
export class CollaborationRedis {
  private readonly logger = new Logger(CollaborationRedis.name);
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async addCollab(
    createCollab: CollabCreateDto,
    roomId: string,
  ): Promise<void> {
    const { user1_id, user2_id } = createCollab;

    // add mapping of user to roomId
    const user1RoomIdKey = `${USER_ROOM_KEY}-${user1_id}`;
    const user2RoomIdKey = `${USER_ROOM_KEY}-${user2_id}`;

    await this.redisClient.set(user1RoomIdKey, roomId);
    await this.redisClient.set(user2RoomIdKey, roomId);

    // add mapping of roomId to some form of collab room data
    throw new Error('Method not implemented.');
  }

  async getCollab(userId: string): Promise<CollabRoomDto | null> {
    this.logger.debug(`Getting collab room for user: ${userId}`);

    throw new Error('Method not implemented.');
  }
}
