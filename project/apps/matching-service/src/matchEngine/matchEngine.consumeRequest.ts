import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MATCH_QUEUE } from 'src/constants/queue';
import { MatchEngineService } from './matchEngine.service';

@Injectable()
export class MatchEngineConsumer implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(MatchEngineConsumer.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly matchEngineService: MatchEngineService,
  ) {
    const connection_url =
      configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(MATCH_QUEUE, { durable: true });
        await channel.consume(MATCH_QUEUE, async (message) => {
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

  public consumeMessage(content: any) {
    this.logger.log('Received message:', content);
    // Perform some sort of match generation
    this.matchEngineService.generateMatch(content);
  }
}
