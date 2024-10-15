import {
  CreateQuestionDto,
  QuestionFiltersDto,
  QuestionCollectionDto,
  QuestionDto,
  UpdateQuestionDto,
} from '@repo/dtos/questions';

import { apiCall } from '@/lib/api/apiClient';

export const fetchQuestions = async (
  queryParams: QuestionFiltersDto,
): Promise<QuestionCollectionDto> => {
  return await apiCall('get', '/questions', null, queryParams);
};

export const fetchQuestionById = async (id: string): Promise<QuestionDto> => {
  return await apiCall('get', `/questions/${id}`);
};

export const createQuestion = async (
  createQuestionDto: CreateQuestionDto,
): Promise<QuestionDto> => {
  return await apiCall('post', '/questions', createQuestionDto);
};

export const updateQuestion = async (
  updateQuestionDto: UpdateQuestionDto,
): Promise<QuestionDto> => {
  return await apiCall(
    'put',
    `/questions/${updateQuestionDto.id}`,
    updateQuestionDto,
  );
};

export const deleteQuestion = async (id: string): Promise<void> => {
  return await apiCall('delete', `/questions/${id}`);
};
