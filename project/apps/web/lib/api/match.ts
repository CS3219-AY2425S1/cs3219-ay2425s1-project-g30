import { MatchCancelDto, MatchRequestMsgDto } from '@repo/dtos/match';

import { apiCall } from '@/lib/api/apiClient';

export const createMatch = async (
  queryParams: MatchRequestMsgDto,
): Promise<any> => {
  return await apiCall('post', '/matches', queryParams);
};

export const cancelMatch = async (
  matchCancel: MatchCancelDto,
): Promise<any> => {
  return await apiCall('post', '/matches/cancel', matchCancel);
};
