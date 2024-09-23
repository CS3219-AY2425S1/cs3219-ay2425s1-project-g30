// apps/backend/api-gateway/src/questions/questions.controller.ts

import {
  Controller,
  Get,
  Param,
  Inject,
  Body,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { CreateQuestionDto, UpdateQuestionDto } from '@repo/dtos/questions';

@Controller('questions')
export class QuestionsController {
  constructor(
    @Inject('QUESTIONS_SERVICE')
    private readonly questionsServiceClient: ClientProxy,
  ) {}

  @Get()
  async getQuestions() {
    return this.questionsServiceClient.send({ cmd: 'get_questions' }, {});
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: bigint) {
    return this.questionsServiceClient.send({ cmd: 'get_question' }, id);
  }

  @Post()
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsServiceClient.send(
      { cmd: 'create_question' },
      createQuestionDto,
    );
  }

  @Put(':id')
  async updateQuestion(@Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsServiceClient.send(
      { cmd: 'update_question' },
      updateQuestionDto,
    );
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: bigint) {
    return this.questionsServiceClient.send({ cmd: 'delete_question' }, { id });
  }
}
