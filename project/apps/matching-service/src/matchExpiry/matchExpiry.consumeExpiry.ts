import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MATCH_EXPIRY_QUEUE } from 'src/constants/queue';
import { EnvService } from 'src/env/env.service';
import { MatchExpiryService } from './matchExpiry.service';

@Injectable()
export class MatchExpiryConsumer implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(MatchExpiryConsumer.name);
  constructor(
    private readonly envService: EnvService,
    private readonly matchExpiryService: MatchExpiryService,
  ) {
    const connection_url = envService.get('RABBITMQ_URL');
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(MATCH_EXPIRY_QUEUE, { durable: true });
        await channel.consume(MATCH_EXPIRY_QUEUE, async (message) => {
          if (message) {
            const matchId = message.content.toString();
            this.consumeMessage(matchId);
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  consumeMessage(matchId: string) {
    matchId = matchId.replace(/^"(.*)"$/, '$1');
    this.logger.log('Received expiry message for match ID:', matchId);
    // pass message to service
    this.matchExpiryService.handleExpiryMessage(matchId);
  }
}
