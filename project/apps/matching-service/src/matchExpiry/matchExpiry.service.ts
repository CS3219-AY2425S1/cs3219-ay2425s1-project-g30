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

  async handleExpiryMessage(expiredMatchReqId: string) {
    // Perform some sort of message handling
    const isMatchRequestAlreadyCancelled =
      await this.matchRedis.isMatchRequestCancelled(expiredMatchReqId);

    if (isMatchRequestAlreadyCancelled) {
      this.logger.debug(
        `Match request with id ${expiredMatchReqId} is already cancelled, skipping expiry message`,
      );
      return;
    }

    const matchRequest =
      await this.matchRedis.removeMatchRequest(expiredMatchReqId);
    if (!matchRequest) {
      this.logger.warn(
        `Match request with id ${expiredMatchReqId} does not exist`,
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
