import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  fetchPayload,
  Server as HocuspocusServer,
  onConnectPayload,
  storePayload,
} from '@hocuspocus/server';
import { Logger as HocuspocusLogger } from '@hocuspocus/extension-logger';
import { Database as HocuspocusDatabase } from '@hocuspocus/extension-database';
import { parse } from 'cookie';
import { firstValueFrom } from 'rxjs';

import { type UserAuthRecordDto } from '@repo/dtos/users';

import { CollaborationRepository } from './domain/ports/collaboration.repository';
import {
  STORE_DOCUMENT_DEBOUNCE,
  STORE_DOCUMENT_MAX_DEBOUNCE,
  WEBSOCKET_TIMEOUT,
} from './domain/constants/server';
import { EnvService } from './env/env.service';

@Injectable()
export class CollaborationGateway implements OnModuleInit {
  private readonly logger = new Logger(CollaborationGateway.name);
  private readonly hpLogger = new Logger('Hocuspocus');

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authServiceClient: ClientProxy,
    private readonly envService: EnvService,
    private readonly collaborationRepository: CollaborationRepository,
  ) {}

  private readonly hocuspocusServer = HocuspocusServer.configure({
    port: this.envService.get('HOCUSPOCUS_PORT'),
    timeout: WEBSOCKET_TIMEOUT,
    debounce: STORE_DOCUMENT_DEBOUNCE,
    maxDebounce: STORE_DOCUMENT_MAX_DEBOUNCE,
    extensions: [
      new HocuspocusDatabase({
        fetch: this.fetchDocument.bind(this),
        store: this.storeDocument.bind(this),
      }),
      new HocuspocusLogger({
        log: (message) => {
          this.hpLogger.debug(message);
        },
      }),
    ],
    onConnect: this.handleConnection.bind(this),
  });

  onModuleInit() {
    this.hocuspocusServer.listen();
    this.logger.log('Hocuspocus server started on port 1234');
  }

  private handleHpError(errorMessage: string) {
    this.hpLogger.error(errorMessage);
    throw new Error(errorMessage);
  }

  private async handleConnection(payload: onConnectPayload) {
    const cookie = payload.requestHeaders.cookie;
    if (!cookie) {
      this.handleHpError('No cookie provided');
    }

    const cookies = parse(cookie!);
    const accessToken = cookies['access_token'];
    if (!accessToken) {
      this.handleHpError('No token provided');
    }

    try {
      const userAuthRecord = (await firstValueFrom(
        this.authServiceClient.send({ cmd: 'verify' }, accessToken!),
      )) as UserAuthRecordDto;
      if (!userAuthRecord) {
        this.handleHpError('userAuthRecord not found');
      }

      // Ensure that user is one of the collaborators
      const documentName = payload.documentName;
      const isVerified = await this.collaborationRepository.verifyCollaborator(
        documentName,
        userAuthRecord.id,
      );
      if (!isVerified) {
        this.handleHpError(
          `User ${userAuthRecord.id} is not a collaborator for document ${documentName}`,
        );
      }

      return { user: userAuthRecord }; // this will be available in the context of the document
    } catch (error) {
      this.handleHpError(`Error verifying token: ${error.message}`);
    }
  }

  private async fetchDocument(data: fetchPayload) {
    const { documentName, context } = data;
    const user = context.user as UserAuthRecordDto;
    try {
      const res =
        await this.collaborationRepository.fetchDocumentById(documentName);
      return res;
    } catch (error) {
      this.logger.error(
        `Error fetching document ${documentName} for user ${user.id}: ${error.message}`,
      );
      return null;
    }
  }

  private async storeDocument(data: storePayload) {
    const { documentName, state, context } = data;
    const user = context.user as UserAuthRecordDto;
    try {
      await this.collaborationRepository.storeDocumentById(documentName, state);
    } catch (error) {
      this.logger.error(
        `Error storing document ${documentName} for user ${user.id}: ${error.message}`,
      );
    }
  }
}
