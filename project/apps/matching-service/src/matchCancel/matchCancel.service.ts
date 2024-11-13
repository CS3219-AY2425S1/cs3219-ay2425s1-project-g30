import { Injectable } from '@nestjs/common';
import { MatchCancelDto } from '@repo/dtos/match';
import { MatchRedis } from 'src/db/match.redis';

@Injectable()
export class MatchCancelService {
  constructor(private readonly matchRedis: MatchRedis) {}

  async cancelMatchRequest(matchCancel: MatchCancelDto) {
    const { match_req_id } = matchCancel;
    return await this.matchRedis.addToCancelledMatchList(match_req_id);
  }
}
