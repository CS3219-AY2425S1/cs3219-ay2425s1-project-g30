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
            const match_req_Id = message.content.toString();
            this.consumeMessage(match_req_Id);
            channel.ack(message);
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  consumeMessage(match_req_Id: string) {
    match_req_Id = match_req_Id.replace(/^"(.*)"$/, '$1'); // To remove quotes
    this.logger.log(
      'Received expiry message for match request ID:' + match_req_Id,
    );
    this.matchExpiryService.handleExpiryMessage(match_req_Id);
  }
}
