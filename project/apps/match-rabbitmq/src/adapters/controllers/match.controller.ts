import { Controller } from '@nestjs/common';
import { MatchConsumer } from 'src/domain/ports/match.consumer';

@Controller()
export class MatchController {
  constructor(private readonly matchConsumer: MatchConsumer) {}
}
