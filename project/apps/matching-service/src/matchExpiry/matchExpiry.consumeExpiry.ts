import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MATCH_EXPIRY_QUEUE } from 'src/constants/queue';
import { MatchExpiryService } from './matchExpiry.service';

@Injectable()
export class MatchExpiryConsumer implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(MatchExpiryConsumer.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly matchExpiryService: MatchExpiryService,
  ) {
    const connection_url =
      configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(MATCH_EXPIRY_QUEUE, { durable: true });
        await channel.consume(MATCH_EXPIRY_QUEUE, async (message) => {
          if (message) {
            const content = JSON.parse(message.content.toString());
            this.consumeMessage(content);
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  consumeMessage(content: any) {
    this.logger.log('Received expiry message:', content);
    // pass message to service
    this.matchExpiryService.handleExpiryMessage(content);
  }
}
