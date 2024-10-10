import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchRequestService } from 'src/matchRequest/matchRequest.service';
import { MatchCancelService } from './matchCancel/matchCancel.service';

@Controller()
export class MatchingController {
  constructor(
    private readonly matchRequestService: MatchRequestService,
    private readonly matchCancelService: MatchCancelService,
  ) {}

  @MessagePattern({ cmd: 'find_match' })
  async findMatch(@Payload() matchData: any) {
    return await this.matchRequestService.enqueueMatchRequest(matchData);
  }

  @MessagePattern({ cmd: 'cancel_match' })
  async cancelMatch(@Payload() matchData: any) {
    return await this.matchCancelService.cancelMatchRequest(matchData);
  }
}
