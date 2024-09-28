// apps/backend/api-gateway/src/questions/questions.controller.ts

import {
  Controller,
  Get,
  Param,
  Inject,
  Body,
  Post,
  UseGuards,
  Put,
  Delete,
  Query,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateQuestionDto,
  createQuestionSchema,
  GetQuestionsQueryDto,
  getQuestionsQuerySchema,
  UpdateQuestionDto,
  updateQuestionSchema,
} from '@repo/dtos/questions';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';

@Controller('questions')
@UseGuards(AuthGuard) // Can comment out if we dw auth for now
export class QuestionsController {
  constructor(
    @Inject('QUESTIONS_SERVICE')
    private readonly questionsServiceClient: ClientProxy,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(getQuestionsQuerySchema))
  async getQuestions(@Query() filters: GetQuestionsQueryDto) {
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
