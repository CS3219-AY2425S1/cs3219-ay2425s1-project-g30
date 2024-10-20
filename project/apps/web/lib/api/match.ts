import { MatchRequestMsgDto } from '@repo/dtos/match';

import { apiCall } from '@/lib/api/apiClient';

export const createMatch = async (
  queryParams: MatchRequestMsgDto,
): Promise<any> => {
  return await apiCall('post', '/matches', queryParams);
};

export const cancelMatch = async (match_req_id: string): Promise<any> => {
  return await apiCall('post', '/matches/cancel', { match_req_id });
};

export const getMatchById = async (id: string): Promise<any> => {
  return await apiCall('get', `/matches/${id}`);
};

export const getMatchesByUserId = async (id: string): Promise<any[]> => {
  return await apiCall('get', `/matches/user/${id}`);
};
