import { Injectable } from '@nestjs/common';
import { MatchCancelDto } from '@repo/dtos/match';
import { MatchRedis } from 'src/db/match.redis';

@Injectable()
export class MatchCancelService {
  constructor(private readonly matchRedis: MatchRedis) {}

  async cancelMatchRequest(matchCancel: MatchCancelDto) {
    this.matchRedis.addToCancelledMatchList(matchCancel.match_req_id);
  }
}
