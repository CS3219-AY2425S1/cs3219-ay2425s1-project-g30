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

  async handleExpiryMessage(expiredMatchId: string) {
    // Perform some sort of message handling
    const matchRequest =
      await this.matchRedis.removeMatchRequest(expiredMatchId);
    if (!matchRequest) {
      this.logger.debug(
        `Match request with id ${expiredMatchId} does not exist`,
      );
      return;
    }
    // Send notification to user about expiry of request
    this.matchGateway.sendMatchRequestExpired({
      userId: matchRequest.userId,
      message: 'match request expired',
    });
  }
}
