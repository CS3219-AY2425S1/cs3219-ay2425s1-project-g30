import { Injectable } from '@nestjs/common';
import { MatchRedis } from 'src/db/match.redis';

@Injectable()
export class MatchExpiryService {
  constructor(private readonly matchRedis: MatchRedis) {}

  handleExpiryMessage(_expiryMessage: any) {
    // Perform some sort of message handling
  }
}
