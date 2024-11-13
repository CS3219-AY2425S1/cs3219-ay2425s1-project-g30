import {
  ChangePasswordDto,
  UpdateUserDto,
  UserCollectionDto,
  UserDataDto,
  UserFiltersDto,
} from '@repo/dtos/users';

import { apiCall } from '@/lib/api/apiClient';

export const fetchUsers = async (
  queryParams: UserFiltersDto,
): Promise<UserCollectionDto> => {
  return await apiCall('get', '/users', null, queryParams);
};

export const fetchUsersById = async (id: string): Promise<UserDataDto> => {
  return await apiCall('get', `/users/${id}`);
};

export const updateUser = async (
  updateUserDto: UpdateUserDto,
): Promise<UserDataDto> => {
  return await apiCall('put', `/users/${updateUserDto.id}`, updateUserDto);
};

export const updateUserPrivilege = async (id: string): Promise<UserDataDto> => {
  return await apiCall('patch', `/users/${id}`);
};

export const changePassword = async (
  changePasswordDto: ChangePasswordDto,
): Promise<UserDataDto> => {
  return await apiCall(
    'patch',
    `/users/password/${changePasswordDto.id}`,
    changePasswordDto,
  );
};

export const deleteUser = async (id: string): Promise<void> => {
  return await apiCall('delete', `/users/${id}`);
};
