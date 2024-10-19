import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MATCH_QUEUE } from 'src/constants/queue';
import { EnvService } from 'src/env/env.service';
import { MatchEngineService } from './matchEngine.service';
import { MatchRequestMsgDto, matchRequestMsgSchema } from '@repo/dtos/match';

@Injectable()
export class MatchEngineConsumer implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(MatchEngineConsumer.name);
  constructor(
    private readonly envService: EnvService,
    private readonly matchEngineService: MatchEngineService,
  ) {
    const connection_url = envService.get('RABBITMQ_URL');
    const connection = amqp.connect([connection_url]);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(MATCH_QUEUE, { durable: true });
        await channel.consume(MATCH_QUEUE, async (message) => {
          if (message) {
            try {
              const content = JSON.parse(message.content.toString());
              const matchRequest = matchRequestMsgSchema.parse(content);
              await this.consumeMessage(matchRequest);
              channel.ack(message);
            } catch (err) {
              this.logger.error('Error occurred consuming message:', err);
              channel.nack(message);
            }
          }
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  public async consumeMessage(content: MatchRequestMsgDto) {
    this.logger.log('Processing Match Request:', content);
    this.matchEngineService.generateMatch(content);
  }
}
