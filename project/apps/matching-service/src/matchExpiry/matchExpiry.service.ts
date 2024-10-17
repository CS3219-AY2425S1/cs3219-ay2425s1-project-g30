import { Injectable, Logger } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';
import { MatchingGateway } from 'src/matching.gateway';

@Injectable()
export class MatchExpiryService {
  private readonly logger = new Logger(MatchExpiryService.name);
  constructor(
    private readonly matchRedis: MatchRedis,
    private readonly matchGateway: MatchingGateway,
  ) {}

  async handleExpiryMessage(_expiredMatchId: string) {
    // Perform some sort of message handling
    const matchRequest = await this.matchRedis.removeMatchRequest(_expiredMatchId);
    if (!matchRequest) {
      this.logger.warn(`Match request with id ${_expiredMatchId} does not exist`);
      return;
    }
    // Send notification to user about expiry of request
    this.matchGateway.sendMatchRequestExpired({
      userId: matchRequest.userId,
      message: 'match request expired',
    });
  }
}
