import { CollabInfoDto } from '@repo/dtos/collab';
import { create } from 'zustand';

import { endCollab, getCollabInfoById } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';

interface CollabState {
  collaboration: CollabInfoDto | null;
  fetchCollab: (id: string) => Promise<void>;
  endCollab: (id: string) => Promise<void>;
  isTerminateModalOpen: boolean;
  setTerminateModalOpen: (isOpen: boolean) => void;
  confirmLoading: boolean;
  setConfirmLoading: (value: boolean) => void;
}

export const useCollabStoreBase = create<CollabState>()((set) => ({
  collaboration: null,
  fetchCollab: async (id: string) => {
    const collab = await getCollabInfoById(id);
    set({ collaboration: collab });
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
