import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionsService } from './questions.service';
import { ZodValidationPipe } from '@repo/pipes/zod-validation-pipe.pipe';
import {
  CreateQuestionDto,
  createQuestionSchema,
  DeleteQuestionDto,
  UpdateQuestionDto,
  updateQuestionSchema,
} from '@repo/dtos/questions';
@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @MessagePattern({ cmd: 'get_questions' })
  async getQuestions() {
    return await this.questionsService.findAll();
  }

  @MessagePattern({ cmd: 'get_question' })
  async getQuestionById(id: bigint) {
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

  // probably need to add some middleware to check if the user is an admin
  // not sure to do it here or in the service
  @MessagePattern({ cmd: 'delete_question' })
  async deleteQuestion(@Payload() deleteQuestionDto: DeleteQuestionDto) {
    return await this.questionsService.delete(deleteQuestionDto);
  }
}
