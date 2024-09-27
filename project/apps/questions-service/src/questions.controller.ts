import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionsService } from './questions.service';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';
import {
  CreateQuestionDto,
  createQuestionSchema,
  UpdateQuestionDto,
  updateQuestionSchema,
} from '@repo/dtos/questions';
@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @MessagePattern({ cmd: 'get_questions' })
  async getQuestions(includeDeleted: boolean) {
    return await this.questionsService.findAll(includeDeleted);
  }

  @MessagePattern({ cmd: 'get_question' })
  async getQuestionById(id: string) {
    return await this.questionsService.findById(id);
  }

  @MessagePattern({ cmd: 'create_question' })
  @UsePipes(new ZodValidationPipe(createQuestionSchema))
  async createQuestion(@Payload() createQuestionDto: CreateQuestionDto) {
    return await this.questionsService.create(createQuestionDto);
  }

  @MessagePattern({ cmd: 'update_question' })
  @UsePipes(new ZodValidationPipe(updateQuestionSchema))
  async updateQuestion(@Payload() createQuestionDto: UpdateQuestionDto) {
    return await this.questionsService.update(createQuestionDto);
  }

  @MessagePattern({ cmd: 'delete_question' })
  async deleteQuestionById(id: string) {
    return await this.questionsService.deleteById(id);
  }
}
