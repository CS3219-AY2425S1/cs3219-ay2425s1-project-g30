import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchRequestService } from 'src/matchRequest/matchRequest.service';
import { MatchCancelService } from './matchCancel/matchCancel.service';
import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';
import { MatchService } from './matching.service';

@Controller()
export class MatchingController {
  constructor(
    private readonly matchRequestService: MatchRequestService,
    private readonly matchCancelService: MatchCancelService,
    private readonly matchService: MatchService,
  ) {}

  @MessagePattern({ cmd: 'find_match' })
  async findMatch(@Payload() matchRequest: MatchRequestMsgDto) {
    return await this.matchRequestService.enqueueMatchRequest(matchRequest);
  }

  @MessagePattern({ cmd: 'cancel_match' })
  async cancelMatch(@Payload() matchCancel: MatchCancelDto) {
    return await this.matchCancelService.cancelMatchRequest(matchCancel);
  }

  @MessagePattern({ cmd: 'get_match' })
  async getMatch(@Payload() matchId: string) {
    return await this.matchService.getMatchById(matchId);
  }

  @MessagePattern({ cmd: 'get_user_matches' })
  async getMatches(@Payload() userId: string) {
    return await this.matchService.getMatchesByUserId(userId);
  }
}
