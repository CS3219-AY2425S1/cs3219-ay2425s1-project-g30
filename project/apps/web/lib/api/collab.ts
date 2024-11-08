import { AttemptCollectionDto } from '@repo/dtos/attempt';
import {
  CollabCollectionDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  ExecutionSnapshotCreateDto,
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

export const saveExecutionSnapshot = async (
  executionSnapshotCreate: ExecutionSnapshotCreateDto,
) => {
  await apiCall('post', `/collaboration/snapshot`, executionSnapshotCreate);
};

export const getAttempts = async (
  collabId: string,
): Promise<AttemptCollectionDto> => {
  return await apiCall('get', `/collaboration/attempts/${collabId}`);
};
