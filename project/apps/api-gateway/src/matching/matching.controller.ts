import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('matches')
export class MatchingController {
  constructor(
    @Inject('MATCHING_SERVICE')
    private readonly matchingServiceClient: ClientProxy,
  ) {}

  @Post()
  async findMatch(@Body() matchCriteria: any) {
    return this.matchingServiceClient.send(
      { cmd: 'find_match' },
      matchCriteria,
    );
  }
}
