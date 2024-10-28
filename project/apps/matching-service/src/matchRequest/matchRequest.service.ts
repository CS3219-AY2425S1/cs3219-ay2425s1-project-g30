import { Injectable, Logger } from '@nestjs/common';
import { MatchRequestDto, MatchRequestMsgDto } from '@repo/dtos/match';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { MATCH_QUEUE } from 'src/constants/queue';
import { EnvService } from 'src/env/env.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatchRequestService {
  private readonly logger = new Logger(MatchRequestService.name);
  private channelWrapper: ChannelWrapper;
  constructor(private readonly envService: EnvService) {
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
      this.logger.warn('Disconnected from RabbitMQ', params.err);
    });

    connection.on('error', (error) => {
      this.logger.error('RabbitMQ connection error', error);
    });

    this.channelWrapper = connection.createChannel({
      setup(channel: Channel) {
        return channel.assertQueue(MATCH_QUEUE, { durable: true });
      },
    });
  }
  /**
   * Enqueues a match request to the matching queue.
   * @param matchReqMsg Data related to the match request.
   */
  async enqueueMatchRequest(matchReqMsg: MatchRequestMsgDto) {
    const match_req_id = uuidv4();

    const matchReq: MatchRequestDto = {
      match_req_id,
      userId: matchReqMsg.userId,
      category: matchReqMsg.category,
      complexity: matchReqMsg.complexity,
      timestamp: Date.now(),
    };

    this.logger.debug(`Enqueuing match request: ${JSON.stringify(matchReq)}`);

    await this.channelWrapper
      .sendToQueue(MATCH_QUEUE, JSON.stringify(matchReq))
      .then(() => {
        this.logger.log('Match request enqueued');
      })
      .catch((err) => {
        this.logger.error(`Failed to enqueue match request: ${err.message}`);
      });
    return { success: true, match_req_id: match_req_id };
  }
}
