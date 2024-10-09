import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchProducer } from 'src/domain/ports/producers/match.producer';

@Controller()
export class MatchingController {
  constructor(private readonly matchProducer: MatchProducer) {}

  @MessagePattern({ cmd: 'find_match' })
  async findMatch(@Payload() matchData: any) {
    return await this.matchProducer.enqueueMatchRequest(matchData);
  }
}
