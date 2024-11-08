import {
  CollabCollectionDto,
  CollabDto,
  CollabFiltersDto,
  CollabInfoDto,
  CollabInfoWithDocumentDto,
  ExecutionSnapshotCollectionDto,
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

export const fetchCollabHistoryById = async (
  id: string,
): Promise<CollabInfoWithDocumentDto> => {
  return await apiCall('get', `/collaboration/history/${id}`);
};

export const saveExecutionSnapshot = async (
  executionSnapshotCreate: ExecutionSnapshotCreateDto,
): Promise<CollabInfoWithDocumentDto> => {
  return await apiCall(
    'post',
    `/collaboration/snapshot`,
    executionSnapshotCreate,
  );
};

export const getExecutionSnapshots = async (
  collabId: string,
): Promise<ExecutionSnapshotCollectionDto> => {
  return await apiCall('get', `/collaboration/snapshot/${collabId}`);
};
