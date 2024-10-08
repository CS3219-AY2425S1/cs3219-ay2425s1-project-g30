import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchingService } from 'src/domain/ports/matching.service';

@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @MessagePattern({ cmd: 'find_match' })
  async findMatch(@Payload() matchData: any) {
    return await this.matchingService.findMatch(matchData);
  }
}
