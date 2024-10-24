import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';

@Controller('matches')
export class MatchingController {
  constructor(
    @Inject('MATCHING_SERVICE')
    private readonly matchingServiceClient: ClientProxy,
  ) {}

  @Post()
  async findMatch(@Body() matchRequest: MatchRequestMsgDto) {
    return this.matchingServiceClient.send({ cmd: 'find_match' }, matchRequest);
  }

  @Post('cancel')
  async cancelMatch(@Body() matchCancel: MatchCancelDto) {
    return this.matchingServiceClient.send(
      { cmd: 'cancel_match' },
      matchCancel,
    );
  }

  @Get(':id')
  async getMatchById(@Param('id') match_id: string) {
    return this.matchingServiceClient.send({ cmd: 'get_match' }, match_id);
  }

  @Get('user/:id')
  async getMatchesByUserId(@Param('id') id: string) {
    return this.matchingServiceClient.send({ cmd: 'get_user_matches' }, id);
  }
}
