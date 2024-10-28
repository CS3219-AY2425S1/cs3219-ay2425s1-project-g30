import { create } from 'zustand';

import { createSelectors } from '@/lib/zustand';
import { UserDataDto } from '@repo/dtos/users';

interface ManageUsersState {
  selectedUser: UserDataDto | null;
  confirmLoading: boolean;
  isUpdateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  setSelectedUser: (value: UserDataDto | null) => void;
  setConfirmLoading: (value: boolean) => void;
  setUpdateModalOpen: (value: boolean) => void;
  setDeleteModalOpen: (value: boolean) => void;
}

export const useManageUsersStoreBase = create<ManageUsersState>((set) => ({
  selectedUser: null,
  confirmLoading: false,
  isUpdateModalOpen: false,
  isDeleteModalOpen: false,
  setSelectedUser: (value) => set({ selectedUser: value }),
  setConfirmLoading: (value) => set({ confirmLoading: value }),
  setUpdateModalOpen: (value) => set({ isUpdateModalOpen: value }),
  setDeleteModalOpen: (value) => set({ isDeleteModalOpen: value }),
}));

export const useManageUsersStore = createSelectors(useManageUsersStoreBase);
