import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import {
  MATCH_EXPIRY_QUEUE,
  MATCH_EXPIRY_ROUTING_KEY,
} from 'src/constants/queue';

@Injectable()
export class MatchExpiryProducer {
  private readonly logger = new Logger(MatchExpiryProducer.name);
  private channelWrapper: ChannelWrapper;
  constructor(private readonly configService: ConfigService) {
    const connection_url =
      configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel({
      setup: async (channel: Channel) => {
        try {
          // Declare a delayed exchange
          await channel.assertExchange(
            'delayed_exchange',
            'x-delayed-message',
            {
              durable: true,
              arguments: { 'x-delayed-type': 'direct' },
            },
          );
          this.logger.log('Declared exchange: delayed_exchange');

          // Declare the queue
          await channel.assertQueue(MATCH_EXPIRY_QUEUE, { durable: true });

          // Bind the queue to the delayed exchange with a routing key
          await channel.bindQueue(
            MATCH_EXPIRY_QUEUE,
            'delayed_exchange',
            MATCH_EXPIRY_ROUTING_KEY,
          );
          this.logger.log(
            `Bound queue ${MATCH_EXPIRY_QUEUE} to exchange delayed_exchange with routing key ${MATCH_EXPIRY_ROUTING_KEY}`,
          );
        } catch (error) {
          this.logger.error(
            `Error setting up exchange and queue: ${error.message}`,
          );
          throw error;
        }
      },
    });
  }

  /**
   * Enqueues a match expiry request to the matching queue.
   * @param matchData Data related to the match request.
   */
  async enqueueMatchExpiryRequest(matchData: any, delayMs: number) {
    this.logger.log(
      `Enqueuing match expiry request: ${JSON.stringify(matchData)}`,
    );
    this.channelWrapper.publish(
      'delayed_exchange',
      MATCH_EXPIRY_ROUTING_KEY,
      Buffer.from(JSON.stringify(matchData)),
      { headers: { 'x-delay': delayMs } },
    );

    return { success: true };
  }
}
