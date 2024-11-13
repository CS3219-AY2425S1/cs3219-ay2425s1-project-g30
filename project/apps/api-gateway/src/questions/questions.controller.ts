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
  UseGuards,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import {
  CreateQuestionDto,
  createQuestionSchema,
  QuestionFiltersDto,
  questionFiltersSchema,
  UpdateQuestionDto,
  updateQuestionSchema,
} from '@repo/dtos/questions';
import {
  CreateTestCasesDto,
  createTestCasesSchema,
  UpdateTestCasesDto,
  updateTestCasesSchema,
} from '@repo/dtos/testCases';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';

@Controller('questions')
@UseGuards(AuthGuard, RolesGuard) // add role guard once authorisation is implemented
export class QuestionsController {
  constructor(
    @Inject('QUESTION_SERVICE')
    private readonly questionsServiceClient: ClientProxy,
  ) {}

  @Get()
  @UsePipes(new ZodValidationPipe(questionFiltersSchema))
  async getQuestions(@Query() filters: QuestionFiltersDto) {
    return this.questionsServiceClient.send({ cmd: 'get_questions' }, filters);
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionsServiceClient.send({ cmd: 'get_question' }, id);
  }

  @Post()
  @Roles(ROLE.Admin)
  @UsePipes(new ZodValidationPipe(createQuestionSchema))
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsServiceClient.send(
      { cmd: 'create_question' },
      createQuestionDto,
    );
  }

  @Put(':id')
  @Roles(ROLE.Admin)
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
  @Roles(ROLE.Admin)
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsServiceClient.send({ cmd: 'delete_question' }, id);
  }

  @Get('/test-cases/:id')
  async getTestCasesByQuestionId(@Param('id') questionId: string) {
    return this.questionsServiceClient.send(
      { cmd: 'get_test_cases' },
      questionId,
    );
  }

  @Post('/test-cases/:id')
  @Roles(ROLE.Admin)
  async createTestCases(
    @Body(new ZodValidationPipe(createTestCasesSchema))
    createTestCasesDto: CreateTestCasesDto,
  ) {
    console.log('Received payload before validation:', createTestCasesDto);
    return this.questionsServiceClient.send(
      { cmd: 'create_test_cases' },
      { ...createTestCasesDto, question_id: createTestCasesDto.question_id },
    );
  }

  @Delete('/test-cases/:testCaseId')
  @Roles(ROLE.Admin)
  async deleteTestCases(@Param('testCaseId') testCaseId: string) {
    return this.questionsServiceClient.send(
      { cmd: 'delete_test_cases' },
      testCaseId,
    );
  }

  @Put('/test-cases/:testCaseId')
  @Roles(ROLE.Admin)
  async updateTestCases(
    @Param('testCaseId') testCaseId: string,
    @Body(new ZodValidationPipe(updateTestCasesSchema))
    updateTestCasesDto: UpdateTestCasesDto,
  ) {
    console.log('Received payload before validation:', updateTestCasesDto);
    if (testCaseId !== updateTestCasesDto.id) {
      throw new BadRequestException(
        'Test case ID in URL does not match ID in body',
      );
    }
    return this.questionsServiceClient.send(
      { cmd: 'update_test_cases' },
      { ...updateTestCasesDto, question_id: updateTestCasesDto.question_id },
    );
  }
}
