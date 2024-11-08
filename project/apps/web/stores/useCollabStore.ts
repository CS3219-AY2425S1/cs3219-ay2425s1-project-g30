import { CollabInfoDto } from '@repo/dtos/collab';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { endCollab, getCollabInfoById } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';

interface CollabState {
  collaboration: CollabInfoDto | null;
  initialiseCollab: (id: string) => Promise<void>;
  endCollab: (id: string) => Promise<void>;
  notifyEndSession: () => void;
  leaveSession: () => void;
  isEndSessionModalOpen: boolean;
  setEndSessionModalOpen: (isOpen: boolean) => void;
  isNotifyEndCollabModalOpen: boolean;
  setNotifyEndCollabModalOpen: (isOpen: boolean) => void;
  isLeaveSessionModalOpen: boolean;
  setIsLeaveSessionModalOpen: (isOpen: boolean) => void;
  collabEnded: boolean;
  setCollabEnded: (value: boolean) => void;
  confirmLoading: boolean;
  setConfirmLoading: (value: boolean) => void;
}

export const useCollabStoreBase = create<CollabState>()((set) => ({
  collaboration: null,
  initialiseCollab: async (id: string) => {
    const collab = await getCollabInfoById(id);
    set({ collaboration: collab });
    sessionStorage.setItem('collaboration', JSON.stringify(collab));
  },

  // For the user who initiated to end the session
  endCollab: async (id: string) => {
    await endCollab(id);
    set({ collaboration: null, isEndSessionModalOpen: false });
    sessionStorage.clear();
  },
  notifyEndSession: () => {
    set({
      collaboration: null,
      collabEnded: true,
      isNotifyEndCollabModalOpen: true,
    });
    sessionStorage.clear();
  },

  // For the other user
  leaveSession: async () => {
    set({
      collabEnded: false,
      isLeaveSessionModalOpen: false,
      isNotifyEndCollabModalOpen: false,
    });
  },

  isEndSessionModalOpen: false,
  setEndSessionModalOpen: (value) => set({ isEndSessionModalOpen: value }),
  isNotifyEndCollabModalOpen: false,
  setNotifyEndCollabModalOpen: (value) => {
    set({ isNotifyEndCollabModalOpen: value });
  },
  isLeaveSessionModalOpen: false,
  setIsLeaveSessionModalOpen: (value) =>
    set({ isLeaveSessionModalOpen: value }),
  confirmLoading: false,
  setConfirmLoading: (value) => set({ confirmLoading: value }),
  collabEnded: false,
  setCollabEnded: (value) => {
    set({ collabEnded: value });
  },
}));

export const useCollabStore = createSelectors(useCollabStoreBase);
