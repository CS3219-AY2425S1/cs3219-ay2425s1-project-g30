import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateQuestionDto,
  QuestionFiltersDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';

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
}
