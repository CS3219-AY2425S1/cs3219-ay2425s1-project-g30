import { Injectable } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';

@Injectable()
export class MatchExpiryService {
  constructor(private readonly matchRedis: MatchRedis) {}

  async handleExpiryMessage(_expiryMessage: any) {
    // Perform some sort of message handling
    const {userId } = _expiryMessage;

    const exists = await this.matchRedis.matchRequestExists(userId);
    if (exists) {
      // remove from redis
      await this.matchRedis.removeMatchRequest(userId);
    }
  }
}
