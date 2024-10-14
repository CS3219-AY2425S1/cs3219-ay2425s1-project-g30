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

enum MatchEvent {
  'MATCH_FOUND' = 'match_found',
  'MATCH_REQUEST_EXPIRED' = 'match_request_expired',
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
    if (! accessToken) {
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
    socketId,
    message,
    event,
  }: {
    socketId: string;
    message: any;
    event: MatchEvent;
  }) {
    this.server.to(socketId).emit(event, message);
  }

  async sendMatchFound({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }) {
    const socketId = await this.matchRedis.getSocketByUserId(userId);
    // TODO: Implement a retry mechanism here if there is either no socket id or the sending failed
    if (socketId) {
      this.sendMessageToClient({
        socketId,
        message,
        event: MatchEvent.MATCH_FOUND,
      });
    }
  }
}
