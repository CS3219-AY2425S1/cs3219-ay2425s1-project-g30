import { Inject, Injectable, Logger } from '@nestjs/common';
import { CATEGORY, COMPLEXITY } from '@repo/dtos/generated/enums/questions.enums';
import { CriteriaDto, MatchRequestDto } from '@repo/dtos/match';
import Redis from 'ioredis';
import { MATCH_CATEGORY, MATCH_GLOBAL, MATCH_REQUEST, MATCH_WAITING_KEY, SOCKET_USER_KEY, USER_SOCKET_KEY } from 'src/constants/redis';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class MatchRedis {
  private readonly logger = new Logger(MatchRedis.name);
  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
  ) {}

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
    //await this.cacheManager.set(userSocketKey, socketId);
    //await this.cacheManager.set(socketUserKey, userId);
  }

  async removeUserBySocketId(socketId: string) {
    const socketUserKey = `${SOCKET_USER_KEY}-${socketId}`;
    //const userId = await this.cacheManager.get(socketUserKey);
    if (userId) {
      const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
      //await this.cacheManager.del(userSocketKey);
    }
    //await this.cacheManager.del(socketUserKey);
  }

  async getSocketByUserId(userId: string) {
    const userSocketKey = `${USER_SOCKET_KEY}-${userId}`;
    //return await this.cacheManager.get<string>(userSocketKey);
  }

  async addMatchRequest(matchRequest: MatchRequestDto): Promise<string | null> {
    const matchId : string = uuidv4();
    const { category, complexity } = matchRequest;
    const timestamp = Date.now();
    
    // Store match requst details to redis in a hash
    const hashKey = `${MATCH_REQUEST}-${matchId}`;
    const globalSortedSetKey = `${MATCH_GLOBAL}`; // This one is for getting oldest requests across all categories

    const pipeline = this.redisClient.multi();

    pipeline.hset(hashKey, {
      userId: matchRequest.userId,
      complexity: complexity,
      category: JSON.stringify(category),
      timestamp: timestamp.toString(),
    });

    pipeline.zadd(globalSortedSetKey, timestamp, matchId);

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
  async getMatchRequest(matchId: string): Promise<MatchRequestDto | null> {
    const hashKey = `${MATCH_REQUEST}-${matchId}`;
    try {
      const data = await this.redisClient.hgetall(hashKey);

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

  async removeMatchRequest(matchId: string) : Promise<string | null> {
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
      return matchId;
    } catch (error) {
      this.logger.error(`Error removing match request: ${error}`);
      return null;
    }
  }

  async findPotentialMatch(criteria: CriteriaDto): Promise<{ userId: string; matchId: string } | null> {
    const { category, complexity } = criteria;

    const pipeline = this.redisClient.pipeline()

    category.forEach(cat => {
      const sortedSetKey = `${MATCH_CATEGORY}-${cat}-COMPLEXITY-${complexity}`;
      pipeline.zrange(sortedSetKey, 0, 0);
    });

    const responses = await pipeline.exec();

    if (!responses) return null

    const fetchPromises = responses.map(async ([err, res], index) => {
      if (err) {
        this.logger.error(`Error fetching matchId(s) from category ${category[index]}:`, err);
        return null;
      }
      const matchId: string = Array.isArray(res) ? res[0] : null;
      if (!matchId) return null;
  
      const matchRequest = await this.getMatchRequest(matchId);
      if (matchRequest) {
        return { matchId, matchRequest };
      }
      return null;
    });
  
    const matchResults = await Promise.all(fetchPromises);
    
     const validResults = matchResults
    .filter(req => req !== null);

    if (validResults.length === 0) return null; // No matches found

    // sort by earliest first
    validResults.sort((a, b) => a.matchRequest.timestamp - b.matchRequest.timestamp);
    const oldestMatch = validResults[0];

    await this.removeMatchRequest(oldestMatch.matchId);

    return { userId: oldestMatch.matchRequest.userId, matchId: oldestMatch.matchId };
  }
}
