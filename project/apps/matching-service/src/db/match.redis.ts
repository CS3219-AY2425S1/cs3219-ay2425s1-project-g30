import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  MATCH_WAITING_KEY,
  SOCKET_USER_KEY,
  USER_SOCKET_KEY,
} from 'src/constants/redis';

@Injectable()
export class MatchRedis {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setMatchRequest(matchId: string, matchData: any) {
    const key = `${MATCH_WAITING_KEY}-${matchId}`;
    await this.cacheManager.set(key, matchData);
  }

  async getMatchRequest(matchId: string) {
    const key = `${MATCH_WAITING_KEY}-${matchId}`;
    return await this.cacheManager.get(key);
  }

  async setUserToSocket({
    userId,
    socketId,
  }: {
    userId: string;
    socketId: string;
  }) {
    const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
    const socketUserKey = `${SOCKET_USER_KEY}-${socketId}`;
    // Bidirectional mapping so we can remove easily when disconnecting
    await this.cacheManager.set(userSocketKey, socketId);
    await this.cacheManager.set(socketUserKey, userId);
  }

  async removeUserBySocketId(socketId: string) {
    const socketUserKey = `${SOCKET_USER_KEY}-${socketId}`;
    const userId = await this.cacheManager.get(socketUserKey);
    if (userId) {
      const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
      await this.cacheManager.del(userSocketKey);
    }
    await this.cacheManager.del(socketUserKey);
  }

  async getSocketByUserId(userId: string) {
    const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
    return await this.cacheManager.get<string>(userSocketKey);
  }
}
