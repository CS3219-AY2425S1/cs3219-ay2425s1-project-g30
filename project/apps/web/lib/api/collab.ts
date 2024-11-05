import {
  CollabCollectionDto,
  CollabFiltersDto,
  CollabInfoWithDocumentDto,
} from '@repo/dtos/collab';

import { apiCall } from '@/lib/api/apiClient';

export const fetchCollabs = async (
  queryParams: CollabFiltersDto,
): Promise<CollabCollectionDto> => {
  return await apiCall('get', '/collaboration', null, queryParams);
};

export const fetchCollaHistorybById = async (
  id: string,
): Promise<CollabInfoWithDocumentDto> => {
  return await apiCall('get', `/collaboration/history/${id}`);
};
