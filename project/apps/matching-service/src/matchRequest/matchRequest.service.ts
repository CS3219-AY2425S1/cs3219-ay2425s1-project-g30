import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchRequestMsgDto } from '@repo/dtos/match';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { MATCH_QUEUE } from 'src/constants/queue';

@Injectable()
export class MatchRequestService {
  private readonly logger = new Logger(MatchRequestService.name);
  private channelWrapper: ChannelWrapper;
  constructor(private readonly configService: ConfigService) {
    const connection_url =
      configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const connection = amqp.connect([connection_url]);
    this.logger.log(`Connecting to RabbitMQ at ${connection_url}`);
    if (!connection) {
      throw new Error('Failed to connect to RabbitMQ');
    }
    this.channelWrapper = connection.createChannel({
      setup(channel: Channel) {
        return channel.assertQueue(MATCH_QUEUE, { durable: true });
      },
    });
  }
  /**
   * Enqueues a match request to the matching queue.
   * @param matchData Data related to the match request.
   */
  async enqueueMatchRequest(matchReq: MatchRequestMsgDto) {
    this.logger.debug(`Enqueuing match request: ${JSON.stringify(matchReq)}`);
    await this.channelWrapper.sendToQueue(
      MATCH_QUEUE,
      JSON.stringify(matchReq)).then(() => {
        this.logger.log('Match request enqueued');
      }).catch((err) => {
        this.logger.error(`Failed to enqueue match request: ${err.message}`);
      }
    )
    return { success: true };
  }
}
