// apps/backend/api-gateway/src/questions/questions.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  // UseGuards,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
// import { AuthGuard } from 'src/auth/auth.guard';
// import { RolesGuard } from 'src/roles/roles.guard';
// import { Roles } from 'src/roles/roles.decorator';
// import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import {
  CreateQuestionDto,
  createQuestionSchema,
  QuestionFiltersDto,
  questionFiltersSchema,
  UpdateQuestionDto,
  updateQuestionSchema,
} from '@repo/dtos/questions';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';

@Controller('questions')
// @UseGuards(AuthGuard, RolesGuard) // comment out if we dw auth for now
export class QuestionsController {
  constructor(
    @Inject('QUESTION_SERVICE')
    private readonly questionsServiceClient: ClientProxy,
  ) {}

  @Get()
  // @Roles(ROLE.User)
  @UsePipes(new ZodValidationPipe(questionFiltersSchema))
  async getQuestions(@Query() filters: QuestionFiltersDto) {
    return this.questionsServiceClient.send({ cmd: 'get_questions' }, filters);
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionsServiceClient.send({ cmd: 'get_question' }, id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createQuestionSchema))
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsServiceClient.send(
      { cmd: 'create_question' },
      createQuestionDto,
    );
  }

  @Put(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateQuestionSchema)) // validation on the body only
    updateQuestionDto: UpdateQuestionDto,
  ) {
    if (id != updateQuestionDto.id) {
      throw new BadRequestException('ID in URL does not match ID in body');
    }
    return this.questionsServiceClient.send(
      { cmd: 'update_question' },
      updateQuestionDto,
    );
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsServiceClient.send({ cmd: 'delete_question' }, id);
  }
}
