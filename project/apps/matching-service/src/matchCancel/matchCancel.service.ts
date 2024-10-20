import { Injectable } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';

@Injectable()
export class MatchCancelService {
  constructor(private readonly matchRedis: MatchRedis) {}

  async cancelMatchRequest(match_req_id: string) {
    return await this.matchRedis.addToCancelledMatchList(match_req_id);
  }
}
