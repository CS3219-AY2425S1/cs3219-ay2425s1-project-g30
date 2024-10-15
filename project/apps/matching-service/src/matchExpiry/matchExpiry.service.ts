import { Injectable, Logger } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';

@Injectable()
export class MatchExpiryService {
  private readonly logger = new Logger(MatchExpiryService.name);
  constructor(private readonly matchRedis: MatchRedis) {}

  async handleExpiryMessage(_expiredMatchId: string) {
    // Perform some sort of message handling
    const exists = await this.matchRedis.removeMatchRequest(_expiredMatchId);
    if (!exists) {
      this.logger.error(`Match request with id ${_expiredMatchId} does not exist`);
    }
    // Send notification to user about expiry of matchid
  }
}
