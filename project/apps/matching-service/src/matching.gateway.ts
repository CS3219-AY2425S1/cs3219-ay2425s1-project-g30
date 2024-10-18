import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { MatchRedis } from './db/match.redis';
import {
  WEBSOCKET_RETRY_ATTEMPTS,
  WEBSOCKET_RETRY_DELAY,
} from './constants/websocket';

enum MatchEvent {
  'MATCH_FOUND' = 'match_found',
  'MATCH_REQUEST_EXPIRED' = 'match_request_expired',
  'MATCH_INVALID' = 'match_invalid',
}

@WebSocketGateway(8080, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class MatchingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(MatchingGateway.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    private readonly matchRedis: MatchRedis,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const cookie = client.handshake.headers.cookie;

    // Disconnect Client if no cookie provided
    if (!cookie) {
      client.disconnect();
      return;
    }

    const cookies = parse(cookie);
    const accessToken = cookies['access_token'];
    // Disconnect client if no token provided
    if (!accessToken) {
      client.disconnect();
      return;
    }
    try {
      const data = await firstValueFrom(
        this.authServiceClient.send({ cmd: 'verify' }, accessToken),
      );

      if (!data) {
        this.logger.log('User Data not found');
        client.disconnect();
        return;
      }

      // TODO: Implement refresh token logic

      // Map socket id to user id in redis
      await this.matchRedis.setUserToSocket({
        userId: data.id,
        socketId: client.id,
      });
    } catch (error) {
      this.logger.log(error);
      client.disconnect();
    }
    // Check if token is valid
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.matchRedis.removeUserBySocketId(client.id);
  }

  async sendMessageToClient({
    userId,
    message,
    event,
    attempt = 1,
  }: {
    userId: string;
    message: any;
    event: MatchEvent;
    attempt?: number;
  }) {
    try {
      const socketId = await this.matchRedis.getSocketByUserId(userId);
      if (!socketId) {
        throw new Error(`Socket not found for user ${userId}`);
      }
      const socket = this.server.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        throw new Error(`Socket ${socketId} is no longer connected`);
      }

      socket.emit(event, message);
      this.logger.debug(`Message sent to socket ${socketId} on event ${event}`);
    } catch (error) {
      this.logger.error(
        `Error sending message to user ${userId} on attempt ${attempt}: ${error.message}`,
      );
      if (attempt < WEBSOCKET_RETRY_ATTEMPTS) {
        setTimeout(
          () => {
            this.sendMessageToClient({
              userId,
              message,
              event,
              attempt: attempt + 1,
            });
          },
          WEBSOCKET_RETRY_DELAY * 2 ** (attempt - 1),
        ); // Exponential backoff
      } else {
        this.logger.error(
          `Failed to send message to user ${userId} after ${WEBSOCKET_RETRY_ATTEMPTS} attempts`,
        );
      }
    }
  }

  async sendMatchFound({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }) {
    if (userId) {
      this.sendMessageToClient({
        userId,
        message,
        event: MatchEvent.MATCH_FOUND,
      });
    }
  }

  async sendMatchRequestExpired({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }) {
    const socketId = await this.matchRedis.getSocketByUserId(userId);
    if (socketId) {
      this.sendMessageToClient({
        userId,
        message,
        event: MatchEvent.MATCH_REQUEST_EXPIRED,
      });
    }
  }

  async sendMatchInvalid({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }) {
    const socketId = await this.matchRedis.getSocketByUserId(userId);
    if (socketId) {
      this.sendMessageToClient({
        userId,
        message,
        event: MatchEvent.MATCH_INVALID,
      });
    }
  }
}
