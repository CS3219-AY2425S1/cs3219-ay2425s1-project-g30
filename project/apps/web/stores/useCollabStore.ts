import { CollabInfoDto } from '@repo/dtos/collab';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { endCollab, getCollabInfoById } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';

interface CollabState {
  collaboration: CollabInfoDto | null;
  setCollaboration: (collab: CollabInfoDto | null) => void;
  fetchCollab: (id: string) => Promise<CollabInfoDto>;
  endCollab: (id: string) => Promise<void>;
  isTerminateModalOpen: boolean;
  setTerminateModalOpen: (isOpen: boolean) => void;
  confirmLoading: boolean;
  setConfirmLoading: (value: boolean) => void;
}

export const useCollabStoreBase = create<CollabState>()(
  persist(
    (set) => ({
      collaboration: null,
      setCollaboration: (collab) => set({ collaboration: collab }),
      fetchCollab: async (id: string) => {
        const collab = await getCollabInfoById(id);
        set({ collaboration: collab });
        return collab;
      },
      endCollab: async (id: string) => {
        await endCollab(id);
        set({ collaboration: null });
      },
      isTerminateModalOpen: false,
      setTerminateModalOpen: (value) => set({ isTerminateModalOpen: value }),
      confirmLoading: false,
      setConfirmLoading: (value) => set({ confirmLoading: value }),
    }),
    {
      name: 'collab-storage',
    },
  ),
);

export const useCollabStore = createSelectors(useCollabStoreBase);
