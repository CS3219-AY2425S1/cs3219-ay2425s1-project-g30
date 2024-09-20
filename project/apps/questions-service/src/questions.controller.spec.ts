import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
  let questionsController: QuestionsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [QuestionsService],
    }).compile();

    questionsController = app.get<QuestionsController>(QuestionsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(questionsController.getQuestion('1')).toBe({
        id: '1',
        title: 'What is NestJS?',
        userId: '1',
      });
    });
  });
});
