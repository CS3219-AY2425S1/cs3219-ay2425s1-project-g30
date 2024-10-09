// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';

// @Injectable()
// export class MatchExpiryProducer {
//   private readonly logger = new Logger(MatchExpiryProducer.name);
//   constructor(
//     @Inject('MATCH_EXPIRY_QUEUE') private readonly matchClient: ClientProxy,
//   ) {}

//   /**
//    * Enqueues a match expiry request to the match expiry queue.
//    * @param matchData Data related to the match expiry request.
//    */
//   async enqueueMatchExpiryRequest(matchData: any): Promise<void> {
//     this.logger.log(
//       `Enqueuing match expiry request: ${JSON.stringify(matchData)}`,
//     );
//   }
// }
