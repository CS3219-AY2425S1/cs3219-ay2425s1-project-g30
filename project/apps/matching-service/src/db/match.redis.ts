import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CATEGORY,
  COMPLEXITY,
} from '@repo/dtos/generated/enums/questions.enums';
import { MatchRequestDto } from '@repo/dtos/match';
import Redis from 'ioredis';
import { MATCH_CANCEL_TTL, MATCH_FETCH_LIMIT } from 'src/constants/queue';
import {
  MATCH_CANCELLED_KEY,
  MATCH_CATEGORY,
  MATCH_REQUEST,
  MATCH_USER,
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
    return userId;
  }

  async getSocketByUserId(userId: string) {
    const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
    return await this.redisClient.get(userSocketKey);
  }

  /**
   * Adds a match request to redis. The match request is stored in a hash with the match_req_Id as the key.
   * The match_req_Id is also added to the sorted set for each selected category in the match request.
   * @param matchRequest The match request to add to redis
   * @returns
   */

  async addMatchRequest(matchRequest: MatchRequestDto): Promise<string | null> {
    const { userId, category, complexity, match_req_id, timestamp } =
      matchRequest;

    // Store match requst details to redis in a hash
    const hashKey = `${MATCH_REQUEST}-${match_req_id}`;
    const pipeline = this.redisClient.multi();

    pipeline.hset(hashKey, {
      userId: userId,
      complexity: complexity,
      category: JSON.stringify(category),
      timestamp: timestamp.toString(),
    });

    // Add match_req_id to the sorted set for each category
    for (const cat of category) {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;
      pipeline.zadd(sortedSetKey, timestamp, match_req_id);
    }

    try {
      await pipeline.exec();
      // Add user match_req_id mapping
      await this.addUserMatchMapaping(userId, match_req_id);
      this.logger.log(`Match request added for id: ${match_req_id}`);
    } catch (error) {
      this.logger.error(`Error adding match request: ${error}`);
      return null;
    }

    return match_req_id;
  }

  /**
   * Fetches a match request from redis
   * @param match_req_id The match_req_id to fetch
   * @returns The match request if found, otherwise null
   */
  async getMatchRequest(match_req_Id: string): Promise<MatchRequestDto | null> {
    const hashKey = `${MATCH_REQUEST}-${match_req_Id}`;
    this.logger.debug(`Hash key: ${hashKey}`);
    try {
      const data = await this.redisClient.hgetall(hashKey);
      if (!data || Object.keys(data).length === 0) return null;

      return {
        match_req_id: match_req_Id,
        userId: data.userId,
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
   * all the associated match_req_Id in the respective sorted set(s)
   * @param match_req_Id The match_req_Id to remove
   * @returns
   */
  async removeMatchRequest(
    match_req_Id: string,
  ): Promise<MatchRequestDto | null> {
    this.logger.log(`Removing Match Request: ${match_req_Id}`);

    const hashKey = `${MATCH_REQUEST}-${match_req_Id}`;
    const matchRequest = await this.getMatchRequest(match_req_Id);

    if (!matchRequest) return null;
    const { category, complexity } = matchRequest;
    const pipeline = this.redisClient.multi();

    for (const cat of category) {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;
      pipeline.zrem(sortedSetKey, match_req_Id);
    }

    pipeline.del(hashKey);

    try {
      await pipeline.exec();

      // Confirm that the match request has been removed
      const existingMatchRequest = await this.getMatchRequest(match_req_Id);
      if (existingMatchRequest) {
        this.logger.error(`Match request ${match_req_Id} not removed`);
        return null;
      } else {
        this.logger.log(`Match request ${match_req_Id} removed`);
      }

      // Remove user match mapping
      await this.removeUserMatchMapping(matchRequest.userId);

      return matchRequest;
    } catch (error) {
      this.logger.error(`Error removing match request: ${error}`);
      return null;
    }
  }

  /**
   * Checks if a match request has been cancelled
   * @param match_req_Id The match_req_Id to check
   * @returns True if the match request has been cancelled, otherwise false
   */
  async isMatchRequestCancelled(match_req_Id: string): Promise<boolean> {
    const key = `${MATCH_CANCELLED_KEY}-${match_req_Id}`;
    return !!(await this.redisClient.get(key));
  }

  /**
   * Finds a potential match in redis based on one of the selected categories and complexity
   * 1. Fetches all the matching match_req_Ids from the sorted set for each category
   * 2. Checks if the match_req_Id is in the cancelled list
   * 3. Sort the list of potential matches by earliest timestamp and choose the oldest request
   * 4. Removes the match request from redis
   * @param criteria Match requester's selected categories and complexity
   * @returns The userId and matchId of the potential match if found, otherwise null
   */

  async findPotentialMatch(
    userId: string,
    categories: CATEGORY[],
    complexity: COMPLEXITY,
  ): Promise<{ userId: string; category: CATEGORY[]; matchId: string } | null> {
    const pipeline = this.redisClient.pipeline();

    categories.forEach((cat) => {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;

      // Note: we do not just fetch the first match request, because we need to check if it is cancelled
      pipeline.zrange(sortedSetKey, 0, MATCH_FETCH_LIMIT - 1);
    });

    const responses = await pipeline.exec();

    if (!responses) return null;

    const fetchPromises = responses.map(async ([err, res], index) => {
      if (err) {
        this.logger.error(
          `Error fetching match_req_Id(s) from category ${categories[index]}:`,
          err,
        );
        return null;
      }

      for (const match_req_Id of res as string[]) {
        if (!match_req_Id) continue;

        const matchRequest = await this.getMatchRequest(match_req_Id);
        if (!matchRequest || matchRequest.userId === userId) continue;

        // Also need to check if the match_req_Id is in the cancelled list
        const isCancelled = await this.isMatchRequestCancelled(match_req_Id);
        if (isCancelled) {
          this.logger.debug(
            `Match request ${match_req_Id} is cancelled, removing match request and skipping`,
          );
          // Remove the cancelled match request from the sorted set
          await this.removeMatchRequest(match_req_Id);
          continue;
        }

        if (matchRequest && !isCancelled) {
          // Partner match request found
          this.logger.debug(`Partner match request found: ${match_req_Id}`);

          // Remove the partner match request from the sorted set
          await this.removeMatchRequest(match_req_Id);
          return matchRequest;
        }
      }

      // No match found for this category
      return null;
    });

    const matchResults = await Promise.all(fetchPromises);

    const validResults = matchResults.filter((req) => req !== null);

    if (validResults.length === 0) return null; // No matches found

    // sort by earliest first
    validResults.sort((a, b) => a.timestamp - b.timestamp);
    const oldestMatch = validResults[0];

    const match_id = uuidv4();

    await this.removeMatchRequest(oldestMatch.match_req_id);

    return {
      userId: oldestMatch.userId,
      category: oldestMatch.category,
      matchId: match_id,
    };
  }

  /**
   * Adds a match_req_Id to the cancelled list in redis
   * We do not remove the match request as it might not exist in redis yet.
   * @param match_req_Id The match_req_Id to add to the cancelled list
   * @returns Object indicating success or failure
   */

  async addToCancelledMatchList(match_req_Id: string) {
    try {
      const key = `${MATCH_CANCELLED_KEY}-${match_req_Id}`;

      await this.redisClient.set(key, match_req_Id);

      // we can be certain that a match_req_Id would have either been matched or expired within 1 hour
      await this.redisClient.expire(key, MATCH_CANCEL_TTL);

      this.logger.log(`Match ${match_req_Id} added to cancelled list`);
    } catch (error) {
      this.logger.error(`Error adding match to cancelled list: ${error}`);
      return {
        success: false,
      };
    }
    return {
      success: true,
    };
  }

  /**
   * Adds a match_req_Id to the user match map in redis
   * @param userId The userId to map
   * @param match_req_id The match_req_id to map
   */

  async addUserMatchMapaping(userId: string, match_req_id: string) {
    try {
      const key = `${MATCH_USER}-${userId}`;
      await this.redisClient.set(key, match_req_id);
      this.logger.log(`Added user-match mapping for ${userId}`);
    } catch (error) {
      this.logger.error(`Error setting userId to matchId: ${error}`);
    }
  }

  /**
   * Removes a user match mapping
   * @param userId The userId to map
   */

  async removeUserMatchMapping(userId: string) {
    try {
      const key = `${MATCH_USER}-${userId}`;
      await this.redisClient.del(key);
      this.logger.log(`Removed user-match mapping for ${userId}`);
    } catch (error) {
      this.logger.error(`Error setting userId to matchId: ${error}`);
    }
  }

  async getUserMatchMapping(userId: string) {
    try {
      const key = `${MATCH_USER}-${userId}`;
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Error getting matchId from userId: ${error}`);
    }
  }
}
