import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MatchProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MatchProducer.name);
  constructor(
    @Inject('MATCH_QUEUE') private readonly matchClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.matchClient.connect();
    this.logger.log('Connected to RabbitMQ Match queue as producer');
  }

  async onModuleDestroy() {
    await this.matchClient.close();
    this.logger.log('Disconnected from RabbitMQ Match queue');
  }

  /**
   * Enqueues a match request to the matching queue.
   * @param matchData Data related to the match request.
   */
  async enqueueMatchRequest(matchData: any): Promise<void> {
    this.logger.log(`Enqueuing match request: ${JSON.stringify(matchData)}`);
    this.matchClient.emit('find_match', matchData);
  }
}
