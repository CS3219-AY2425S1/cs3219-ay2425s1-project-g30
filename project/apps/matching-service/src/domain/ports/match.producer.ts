import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class MatchProducer {
  private readonly logger = new Logger(MatchProducer.name);
  private channelWrapper: ChannelWrapper;
  constructor(private readonly configService: ConfigService) {
    const connection_url =
      configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel({
      setup(channel: Channel) {
        return channel.assertQueue('matchQueue', { durable: true });
      },
    });
  }

  /**
   * Enqueues a match request to the matching queue.
   * @param matchData Data related to the match request.
   */
  async enqueueMatchRequest(matchData: any) {
    this.logger.log(`Enqueuing match request: ${JSON.stringify(matchData)}`);
    this.channelWrapper.sendToQueue(
      'matchQueue',
      Buffer.from(JSON.stringify(matchData)),
    );

    return { success: true };
  }
}
