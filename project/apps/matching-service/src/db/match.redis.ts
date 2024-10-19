import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import {
  MatchCriteriaDto,
  MatchRequestDto,
  MatchRequestMsgDto,
} from '@repo/dtos/match';
import Redis from 'ioredis';
import { MATCH_EXPIRY_TTL } from 'src/constants/queue';
import {
  MATCH_CANCELLED_KEY,
  MATCH_CATEGORY,
  MATCH_REQUEST,
  REDIS_CLIENT,
} from 'src/constants/redis';
import { SOCKET_USER_KEY, USER_SOCKET_KEY } from 'src/constants/websocket';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatchRedis {
  private readonly logger = new Logger(MatchRedis.name);
  constructor(@Inject(REDIS_CLIENT) private redisClient: Redis) {}

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
    await this.redisClient.set(userSocketKey, socketId);
    await this.redisClient.set(socketUserKey, userId);
  }

  async removeUserBySocketId(socketId: string) {
    const socketUserKey = `${SOCKET_USER_KEY}-${socketId}`;
    const userId = await this.redisClient.get(socketUserKey);
    if (userId) {
      const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
      await this.redisClient.del(userSocketKey);
    }
    await this.redisClient.del(socketUserKey);
  }

  async getSocketByUserId(userId: string) {
    const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
    return await this.redisClient.get(userSocketKey);
  }

  /**
   * Adds a match request to redis. The match request is stored in a hash with the matchId as the key.
   * The matchId is also added to the sorted set for each selected category in the match request.
   * @param matchRequest The match request to add to redis
   * @returns
   */

  async addMatchRequest(
    matchRequest: MatchRequestMsgDto,
  ): Promise<string | null> {
    const matchId: string = uuidv4();
    const { category, complexity } = matchRequest;
    const timestamp = Date.now();

    // Store match requst details to redis in a hash
    const hashKey = `${MATCH_REQUEST}-${matchId}`;
    const pipeline = this.redisClient.multi();

    pipeline.hset(hashKey, {
      userId: matchRequest.userId,
      complexity: complexity,
      category: JSON.stringify(category),
      timestamp: timestamp.toString(),
    });

    // Add matchId to the sorted set for each category
    for (const cat of category) {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;
      pipeline.zadd(sortedSetKey, timestamp, matchId);
    }

    try {
      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Error adding match request: ${error}`);
      return null;
    }

    return matchId;
  }

  /**
   * Fetches a match request from redis
   * @param matchId The matchId to fetch
   * @returns The match request if found, otherwise null
   */
  async getMatchRequest(matchId: string): Promise<MatchRequestDto | null> {
    const hashKey = `${MATCH_REQUEST}-${matchId}`;
    this.logger.debug(`Hash key: ${hashKey}`);
    try {
      const data = await this.redisClient.hgetall(hashKey);
      this.logger.log(data);
      if (!data || Object.keys(data).length === 0) return null;

      return {
        userId: data.userId as string,
        complexity: data.complexity as COMPLEXITY,
        category: JSON.parse(data.category) as CATEGORY[],
        timestamp: parseInt(data.timestamp, 10),
      };
    } catch (error) {
      this.logger.error(`Error fetching match request: ${error}`);
      return null;
    }
  }

  /**
   * Removes a match request from redis that includes its match request hash key and
   * all the associated matchId in the respective sorted set(s)
   * @param matchId The matchId to remove
   * @returns
   */
  async removeMatchRequest(matchId: string): Promise<MatchRequestDto | null> {
    this.logger.log(`Removing Match Request: ${matchId}`);
    const hashKey = `${MATCH_REQUEST}-${matchId}`;
    const matchRequest = await this.getMatchRequest(matchId);
    if (!matchRequest) return null;
    const { category, complexity } = matchRequest;
    const pipeline = this.redisClient.multi();

    for (const cat of category) {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;
      pipeline.zrem(sortedSetKey, matchId);
    }

    pipeline.del(hashKey);

    try {
      await pipeline.exec();
      return matchRequest;
    } catch (error) {
      this.logger.error(`Error removing match request: ${error}`);
      return null;
    }
  }

  /**
   * Finds a potential match in redis based on one of the selected categories and complexity
   * 1. Fetches all the matching matchIds from the sorted set for each category
   * 2. Checks if the matchId is in the cancelled list
   * 3. Sort the list of potential matches by earliest timestamp and choose the oldest request
   * 4. Removes the match request from redis
   * @param criteria Match requester's selected categories and complexity
   * @returns The userId and matchId of the potential match if found, otherwise null
   */

  async findPotentialMatch(
    criteria: MatchCriteriaDto,
  ): Promise<{ userId: string; category: CATEGORY[]; matchId: string } | null> {
    const { category, complexity } = criteria;

    const pipeline = this.redisClient.pipeline();

    category.forEach((cat) => {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;
      pipeline.zrange(sortedSetKey, 0, 0);
    });

    const responses = await pipeline.exec();

    if (!responses) return null;

    const fetchPromises = responses.map(async ([err, res], index) => {
      if (err) {
        this.logger.error(
          `Error fetching matchId(s) from category ${category[index]}:`,
          err,
        );
        return null;
      }
      const matchId: string = Array.isArray(res) ? res[0] : null;
      if (!matchId) return null;

      const matchRequest = await this.getMatchRequest(matchId);

      // Also need to check if the matchId is in the cancelled list
      const cancelledKey = `${MATCH_CANCELLED_KEY}-${matchId}`;
      const isCancelled = await this.redisClient.get(cancelledKey);

      if (matchRequest && !isCancelled) {
        return { matchId, matchRequest };
      }
      return null;
    });

    const matchResults = await Promise.all(fetchPromises);

    const validResults = matchResults.filter((req) => req !== null);

    if (validResults.length === 0) return null; // No matches found

    // sort by earliest first
    validResults.sort(
      (a, b) => a.matchRequest.timestamp - b.matchRequest.timestamp,
    );
    const oldestMatch = validResults[0];

    await this.removeMatchRequest(oldestMatch.matchId);

    return {
      userId: oldestMatch.matchRequest.userId,
      category: oldestMatch.matchRequest.category,
      matchId: oldestMatch.matchId,
    };
  }

  /**
   * Adds a matchId to the cancelled list in redis
   * @param matchId The matchId to add to the cancelled list
   */

  async addToCancelledMatchList(matchId: string) {
    try {
      const key = `${MATCH_CANCELLED_KEY}-${matchId}`;

      await this.redisClient.set(key, matchId);

      // we can be certain that a matchId would have either been matched or expired within 1 hour
      await this.redisClient.expire(key, MATCH_EXPIRY_TTL); // 1 hour

      this.logger.log(`Match ${matchId} added to cancelled list`);
    } catch (error) {
      this.logger.error(`Error adding match to cancelled list: ${error}`);
    }
  }
}
