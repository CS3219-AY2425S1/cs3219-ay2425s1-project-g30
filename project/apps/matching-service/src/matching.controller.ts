import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchRequestService } from 'src/matchRequest/matchRequest.service';
import { MatchCancelService } from './matchCancel/matchCancel.service';
import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';

@Controller()
export class MatchingController {
  constructor(
    private readonly matchRequestService: MatchRequestService,
    private readonly matchCancelService: MatchCancelService,
  ) {}

  @MessagePattern({ cmd: 'find_match' })
  async findMatch(@Payload() matchRequest: MatchRequestMsgDto) {
    return await this.matchRequestService.enqueueMatchRequest(matchRequest);
  }

  @MessagePattern({ cmd: 'cancel_match' })
  async cancelMatch(@Payload() matchCancel: MatchCancelDto) {
    return await this.matchCancelService.cancelMatchRequest(matchCancel);
  }
}
