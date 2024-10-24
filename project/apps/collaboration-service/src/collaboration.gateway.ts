import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Hocuspocus } from '@hocuspocus/server';

@Injectable()
export class CollaborationGateway implements OnModuleInit {
  private readonly logger = new Logger(CollaborationGateway.name);
  private instanceId;

  constructor() {
    this.instanceId = Math.random().toString(36).substring(7);
    this.logger.debug(`Instance ID: ${this.instanceId}`);
  }

  private readonly hocuspocusServer = new Hocuspocus({
    port: 1234,
  });

  onModuleInit() {
    this.hocuspocusServer.listen();
    this.logger.log('Hocuspocus server started on port 1234');
  }
}
