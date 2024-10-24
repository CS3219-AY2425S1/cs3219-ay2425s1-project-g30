import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MATCH_QUEUE } from 'src/constants/queue';
// import { EnvService } from 'src/env/env.service';
import { MatchEngineService } from './matchEngine.service';
import { MatchRequestDto, matchRequestSchema } from '@repo/dtos/match';

@Injectable()
export class MatchEngineConsumer implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(MatchEngineConsumer.name);
  constructor(
    // private readonly envService: EnvService,
    private readonly matchEngineService: MatchEngineService,
  ) {
    // const connection_url = envService.get('RABBITMQ_URL');

    // temp fix for milestone D4
    let connection_url = process.env.RABBITMQ_URL;
    if (!connection_url) {
      connection_url = 'amqp://rabbitmq:5672';
    }

    this.logger.log(`Connecting to RabbitMQ at url: ${connection_url}`);

    const connection = amqp.connect([connection_url]);

    // Monitor the connection events
    connection.on('connect', () => {
      this.logger.log('Successfully connected to RabbitMQ');
    });

    connection.on('disconnect', (params) => {
      this.logger.error('Disconnected from RabbitMQ', params.err);
    });

    connection.on('error', (error) => {
      this.logger.error('RabbitMQ connection error', error);
    });

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
              const matchRequest = matchRequestSchema.parse(content);
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

  public async consumeMessage(content: MatchRequestDto) {
    this.logger.log('Processing Match Request:', content);
    this.matchEngineService.generateMatch(content);
  }
}
