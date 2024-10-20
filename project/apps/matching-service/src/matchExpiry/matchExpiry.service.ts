import { Injectable, Logger } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';
import { MatchingGateway } from 'src/matching.gateway';

@Injectable()
export class MatchExpiryService {
  private readonly logger = new Logger(MatchExpiryService.name);
  private readonly instanceId;

  constructor(
    private readonly matchRedis: MatchRedis,
    private readonly matchGateway: MatchingGateway,
  ) {
    this.instanceId = Math.random().toString(36).substring(7);
    this.logger.log(
      'MatchExpiryService initialized with instanceId: ' + this.instanceId,
    );
  }

  async handleExpiryMessage(expiredMatchReqId: string) {
    this.logger.log(`MatchExpiryService instance: ${this.instanceId}`);
    // Perform some sort of message handling
    const matchRequest =
      await this.matchRedis.removeMatchRequest(expiredMatchReqId);
    if (!matchRequest) {
      this.logger.debug(
        `Match request with id ${expiredMatchReqId} does not exist`,
      );
      return;
    }

    this.logger.log(`matchGatewayId: ${this.matchGateway.getInstanceId()}`);
    if (!this.matchGateway.server) {
      this.logger.error('MatchGateway server is not initialized');
      return;
    }

    // Send notification to user about expiry of request
    this.matchGateway.sendMatchRequestExpired({
      userId: matchRequest.userId,
      message: 'match request expired',
    });
  }
}
