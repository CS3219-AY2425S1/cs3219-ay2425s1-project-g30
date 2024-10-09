import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { MATCH_EXPIRY_QUEUE } from 'src/constants/queue';

@Injectable()
export class MatchExpiryProducer {
  private readonly logger = new Logger(MatchExpiryProducer.name);
  private channelWrapper: ChannelWrapper;
  constructor(private readonly configService: ConfigService) {
    const connection_url =
      configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel({
      setup(channel: Channel) {
        return channel.assertQueue(MATCH_EXPIRY_QUEUE, { durable: true });
      },
    });
  }

  /**
   * Enqueues a match request to the matching queue.
   * @param matchData Data related to the match request.
   */
  async enqueueMatchExpiryRequest(matchData: any) {
    this.logger.log(
      `Enqueuing match expiry request: ${JSON.stringify(matchData)}`,
    );
    this.channelWrapper.sendToQueue(
      MATCH_EXPIRY_QUEUE,
      Buffer.from(JSON.stringify(matchData)),
    );

    return { success: true };
  }
}
