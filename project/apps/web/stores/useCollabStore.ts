import { create } from 'zustand';

import { endCollab } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';

interface CollabState {
  endCollab: (id: string) => Promise<void>;
  notifyEndSession: (id: string) => void;
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
  // For the user who initiated to end the session
  endCollab: async (id: string) => {
    await endCollab(id);
    set({ isEndSessionModalOpen: false });
  },
  notifyEndSession: () => {
    set({
      collabEnded: true,
      isNotifyEndCollabModalOpen: true,
    });
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
