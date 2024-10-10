import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MATCH_WAITING_KEY } from 'src/constants/redis';

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
}
