import { CollabCollectionDto, CollabFiltersDto } from '@repo/dtos/collab';

import { apiCall } from '@/lib/api/apiClient';

export const fetchCollabs = async (
  queryParams: CollabFiltersDto,
): Promise<CollabCollectionDto> => {
  return await apiCall('get', '/collaboration', null, queryParams);
};
