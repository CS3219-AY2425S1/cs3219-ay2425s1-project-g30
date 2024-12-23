import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateQuestionDto,
  QuestionFiltersDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';
import { CollabQuestionDto } from '@repo/dtos/collab';
import { CreateTestCasesDto, UpdateTestCasesDto } from '@repo/dtos/testCases';

import { QuestionsService } from 'src/domain/ports/questions.service';
@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @MessagePattern({ cmd: 'get_questions' })
  async getQuestions(@Payload() filters: QuestionFiltersDto) {
    return await this.questionsService.findAll(filters);
  }

  @MessagePattern({ cmd: 'get_question' })
  async getQuestionById(@Payload() id: string) {
    return await this.questionsService.findById(id);
  }

  @MessagePattern({ cmd: 'get_random_question' })
  async getRandomQuestion(@Payload() filters: CollabQuestionDto) {
    return await this.questionsService.findRandom(filters);
  }

  @MessagePattern({ cmd: 'create_question' })
  async createQuestion(@Payload() createQuestionDto: CreateQuestionDto) {
    return await this.questionsService.create(createQuestionDto);
  }

  @MessagePattern({ cmd: 'update_question' })
  async updateQuestion(@Payload() updateQuestionDto: UpdateQuestionDto) {
    return await this.questionsService.update(updateQuestionDto);
  }

  @MessagePattern({ cmd: 'delete_question' })
  async deleteQuestionById(@Payload() id: string) {
    return await this.questionsService.deleteById(id);
  }

  @MessagePattern({ cmd: 'create_test_cases' })
  async createTestCases(@Payload() createTestCasesDto: CreateTestCasesDto) {
    return await this.questionsService.createTestCases(createTestCasesDto);
  }

  @MessagePattern({ cmd: 'delete_test_cases' })
  async deleteTestCases(@Payload() testCaseId: string) {
    return await this.questionsService.deleteTestCases(testCaseId);
  }

  @MessagePattern({ cmd: 'update_test_cases' })
  async updateTestCases(@Payload() updateTestCasesDto: UpdateTestCasesDto) {
    return await this.questionsService.updateTestCases(updateTestCasesDto);
  }

  @MessagePattern({ cmd: 'get_test_cases' })
  async getTestCasesByQuestionId(@Payload() questionId: string) {
    return await this.questionsService.findTestCasesByQuestionId(questionId);
  }
}
