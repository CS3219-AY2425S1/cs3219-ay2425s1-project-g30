import { CollabInfoDto } from '@repo/dtos/collab';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand';
import { endCollab, getCollabInfoById, verifyCollab } from '@/lib/api/collab';

interface CollabState {
  collaboration: CollabInfoDto | null;
  fetchCollabInfo: (id: string) => Promise<void>;
  verifyCollab: (id: string) => Promise<boolean>;
  endCollab: (id: string) => Promise<void>;
  isTerminateModalOpen: boolean;
  setTerminateModalOpen: (isOpen: boolean) => void;
  confirmLoading: boolean;
  setConfirmLoading: (value: boolean) => void;
}

export const useCollabStoreBase = create<CollabState>()((set) => ({
  collaboration: null,
  fetchCollabInfo: async (id: string) => {
    const collabInfo = await getCollabInfoById(id);
    set({ collaboration: collabInfo });
  },
  verifyCollab: async (id: string) => {
    return await verifyCollab(id);
  },
  endCollab: async (id: string) => {
    await endCollab(id);
    set({ collaboration: null });
  },
  isTerminateModalOpen: false,
  setTerminateModalOpen: (value) => set({ isTerminateModalOpen: value }),
  confirmLoading: false,
  setConfirmLoading: (value) => set({ confirmLoading: value }),
}));

export const useCollabStore = createSelectors(useCollabStoreBase);
