import { create } from 'zustand';

import { createSelectors } from '@/lib/zustand';

interface ProfileState {
  isEditingUsername: boolean;
  isEditingEmail: boolean;
  confirmLoading: boolean;
  isChangePasswordModalOpen: boolean;
  isDeleteModalOpen: boolean;
  setIsEditingUsername: (value: boolean) => void;
  setIsEditingEmail: (value: boolean) => void;
  setConfirmLoading: (value: boolean) => void;
  setChangePasswordModalOpen: (value: boolean) => void;
  setDeleteModalOpen: (value: boolean) => void;
}

export const useProfileStoreBase = create<ProfileState>((set) => ({
  isEditingUsername: false,
  isEditingEmail: false,
  confirmLoading: false,
  isChangePasswordModalOpen: false,
  isDeleteModalOpen: false,
  setIsEditingUsername: (value) => set({ isEditingUsername: value }),
  setIsEditingEmail: (value) => set({ isEditingEmail: value }),
  setConfirmLoading: (value) => set({ confirmLoading: value }),
  setChangePasswordModalOpen: (value) =>
    set({ isChangePasswordModalOpen: value }),
  setDeleteModalOpen: (value) => set({ isDeleteModalOpen: value }),
}));

export const useProfileStore = createSelectors(useProfileStoreBase);
