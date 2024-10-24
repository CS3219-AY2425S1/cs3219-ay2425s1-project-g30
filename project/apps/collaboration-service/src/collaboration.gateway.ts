import { Logger, Req } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { Server as HocuspocusServer } from '@hocuspocus/server';
import { Request } from 'express';

export const server = HocuspocusServer.configure({
  name: 'collaboration-service-hocuspocus',
  port: 1234,
  timeout: 30000,
  debounce: 5000,
  maxDebounce: 30000,
  quiet: true,
});

@WebSocketGateway(8081, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() _server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);

  constructor() {}

  afterInit() {
    const test = server.getConnectionsCount();
    this.logger.log(`Connections: ${test}`);
  }

  handleConnection(client: Socket, @Req() request: Request) {
    this.logger.log(`Client connected: ${client.id}`);
    server.handleConnection(client, request);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
