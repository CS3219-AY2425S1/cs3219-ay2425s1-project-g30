import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MatchExpiryProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MatchExpiryProducer.name);
  constructor(
    @Inject('MATCH_EXPIRY_QUEUE')
    private readonly matchExpiryClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.matchExpiryClient.connect();
    this.logger.log('Connected to RabbitMQ Match Expiry queue as producer');
  }

  async onModuleDestroy() {
    await this.matchExpiryClient.close();
    this.logger.log('Disconnected from RabbitMQ Match Expiry queue');
  }

  /**
   * Enqueues a match request to the matching queue.
   * @param matchData Data related to the match request.
   */
  async enqueueMatchRequest(matchData: any): Promise<void> {
    this.logger.log(
      `Enqueuing match expiry request: ${JSON.stringify(matchData)}`,
    );
    this.matchExpiryClient.emit('find_match', matchData);
  }
}
