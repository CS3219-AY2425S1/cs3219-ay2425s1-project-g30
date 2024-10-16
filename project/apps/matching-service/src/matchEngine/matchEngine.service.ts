import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchExpiryProducer } from './matchEngine.produceExpiry';
import { MatchRedis } from 'src/db/match.redis';
import { MatchSupabase } from 'src/db/match.supabase';
import { MatchingGateway } from 'src/matching.gateway';
import { MatchDataDto, MatchRequestMsgDto } from '@repo/dtos/match';
import { MATCH_TIMEOUT } from 'src/constants/queue';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {QuestionCollectionDto, QuestionFiltersDto,
} from '@repo/dtos/questions';

@Injectable()
export class MatchEngineService {
  private readonly logger = new Logger(MatchEngineService.name);
  constructor(
    @Inject('QUESTION_SERVICE') private readonly questionServiceClient: ClientProxy,
    private readonly matchEngineProduceExpiry: MatchExpiryProducer,
    private readonly matchRedis: MatchRedis,
    private readonly matchSupabase: MatchSupabase,
    private readonly matchGateway: MatchingGateway,
  ) {}

  async generateMatch(matchRequest: MatchRequestMsgDto) {
    const {userId, category, complexity} = matchRequest;

    const matchedUser = await this.matchRedis.findPotentialMatch({category, complexity});

    if (matchedUser) {
      this.logger.log(`Match found for user ${userId} and ${matchedUser.userId}`);

      const filters: QuestionFiltersDto = {
        categories: category,
        complexities: [complexity],
      };

      const selectedCollection = await firstValueFrom(
        this.questionServiceClient.send<QuestionCollectionDto>({ cmd: 'get_questions' }, filters)
      );
      // Choosing by random because get_questions will return collection in same sequence
      const ind: number =
      Math.floor(Math.random() * selectedCollection.questions.length);
      
      const matchData: MatchDataDto = {
        user1_id: userId,
        user2_id: matchedUser.userId,
        complexity: complexity,
        category: category,
        id: matchedUser.matchId,
        question_id: selectedCollection.questions[ind].id
      };

      this.logger.debug(`Saving match data to DB: ${JSON.stringify(matchData)}`);

      this.matchGateway.sendMatchFound({
        userId: matchedUser.userId,
        message: 'success',
      });
      await this.matchSupabase.saveMatch(matchData);
    } else {
      this.logger.log(`No match found for user ${userId}, adding to matching queue`);
      // No match found, add the match to redis
      const matchid = await this.matchRedis.addMatchRequest(matchRequest);
      if (!matchid) {
        throw new Error("Failed to add match request");
      }
      await this.matchEngineProduceExpiry.enqueueMatchExpiryRequest(matchid, MATCH_TIMEOUT);
    }
  }
}
