import {
  CreateTestCasesDto,
  TestCasesDto,
  UpdateTestCasesDto,
} from '@repo/dtos/testCases';

import { apiCall } from '@/lib/api/apiClient';

export const fetchTestCasesByQuestionId = async (
  questionId: string,
): Promise<TestCasesDto | null> => {
  return await apiCall('get', `/questions/test-cases/${questionId}`);
};

export const createTestCases = async (
  createTestCasesDto: CreateTestCasesDto,
): Promise<TestCasesDto> => {
  return await apiCall(
    'post',
    `/questions/test-cases/${createTestCasesDto.question_id}`,
    createTestCasesDto,
  );
};

export const deleteTestCases = async (testCaseId: string): Promise<void> => {
  return await apiCall('delete', `/questions/test-cases/${testCaseId}`);
};

export const updateTestCases = async (
  updateTestCasesDto: UpdateTestCasesDto,
): Promise<TestCasesDto> => {
  return await apiCall(
    'put',
    `/questions/test-cases/${updateTestCasesDto.id}`,
    updateTestCasesDto,
  );
};
