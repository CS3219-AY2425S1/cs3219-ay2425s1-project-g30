import { MatchDataDto, MatchRequestDto } from '@repo/dtos/match';

import { apiCall } from '@/lib/api/apiClient';

export const createMatch = async (
  queryParams: MatchRequestDto,
): Promise<MatchDataDto> => {
  return await apiCall('post', '/matches', null, queryParams);
};
