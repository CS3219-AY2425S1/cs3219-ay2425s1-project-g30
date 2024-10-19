import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('matches')
export class MatchingController {
  constructor(
    @Inject('MATCHING_SERVICE')
    private readonly matchingServiceClient: ClientProxy,
  ) {}

  @Post()
  async findMatch(@Body() matchRequest: any) {
    return this.matchingServiceClient.send({ cmd: 'find_match' }, matchRequest);
  }
  @Get(':id')
  async getMatchById(@Param('id') id: string) {
    return this.matchingServiceClient.send({ cmd: 'get_match' }, id);
  }

  @Get('user/:id')
  async getMatchesByUserId(@Param('id') id: string) {
    return this.matchingServiceClient.send({ cmd: 'get_user_matches' }, id);
  }
}
