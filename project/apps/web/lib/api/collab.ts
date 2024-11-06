import {
  CollabCollectionDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  CollabInfoWithDocumentDto,
} from '@repo/dtos/collab';

import { apiCall } from '@/lib/api/apiClient';

export const getCollabInfoById = async (id: string): Promise<CollabInfoDto> => {
  return await apiCall('get', `/collaboration/${id}`);
};

export const getCollabs = async (
  filters: CollabFiltersDto,
): Promise<CollabCollectionDto> => {
  return await apiCall('get', '/collaboration', null, filters);
};

export const verifyCollab = async (id: string): Promise<boolean> => {
  return await apiCall('get', `/collaboration/verify/${id}`);
};

export const endCollab = async (id: string): Promise<CollabDto> => {
  return await apiCall('post', `/collaboration/end/${id}`);
};

export const fetchCollaHistorybById = async (
  id: string,
): Promise<CollabInfoWithDocumentDto> => {
  return await apiCall('get', `/collaboration/history/${id}`);
};
