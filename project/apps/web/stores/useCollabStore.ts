import { CollabInfoDto } from '@repo/dtos/collab';
import { create } from 'zustand';

import { endCollab, getCollabInfoById } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';

interface CollabState {
  collaboration: CollabInfoDto | null;
  initialiseCollab: (id: string) => Promise<void>;
  endSession: () => void;
  endCollab: (id: string) => Promise<void>;
  isEndSessionModalOpen: boolean;
  setEndSessionModalOpen: (isOpen: boolean) => void;
  isNotifyEndCollabModalOpen: boolean;
  setNotifyEndCollabModalOpen: (isOpen: boolean) => void;
  isEndCollabModalOpen: boolean;
  setEndCollabModalOpen: (isOpen: boolean) => void;
  collabExpiryTime: Date;
  setCollabExpiryTime: (time: Date) => void;
  collabEnding: boolean;
  setCollabEnding: (value: boolean) => void;
  confirmLoading: boolean;
  setConfirmLoading: (value: boolean) => void;
}

export const useCollabStoreBase = create<CollabState>()((set) => ({
  // Store in session storage
  collaboration: null,

  initialiseCollab: async (id: string) => {
    const collab = await getCollabInfoById(id);
    set({ collaboration: collab });
    sessionStorage.setItem('collaboration', JSON.stringify(collab));
  },

  // For the user who initiated to end the session
  endSession: async () => {
    set({ collaboration: null, isEndSessionModalOpen: false });
    sessionStorage.removeItem('collaboration');
  },

  // For the other user
  endCollab: async (id: string) => {
    await endCollab(id);
    set({
      collaboration: null,
      collabEnding: false,
      isEndCollabModalOpen: false,
      isNotifyEndCollabModalOpen: false,
    });
    sessionStorage.clear();
  },

  isEndSessionModalOpen: false,
  setEndSessionModalOpen: (value) => set({ isEndSessionModalOpen: value }),
  isEndCollabModalOpen: false,
  setEndCollabModalOpen: (value) => set({ isEndCollabModalOpen: value }),
  confirmLoading: false,
  setConfirmLoading: (value) => set({ confirmLoading: value }),

  // For the user who did not end the session
  // Get and store in session storage
  isNotifyEndCollabModalOpen:
    sessionStorage.getItem('isNotifyEndCollabModalOpen') == 'true',
  setNotifyEndCollabModalOpen: (value) => {
    set({ isNotifyEndCollabModalOpen: value });
    sessionStorage.setItem('isNotifyEndCollabModalOpen', JSON.stringify(value));
  },
  collabExpiryTime: new Date(sessionStorage.getItem('collabExpiryTime') || ''),
  setCollabExpiryTime: (time) => {
    set({ collabExpiryTime: time });
    sessionStorage.setItem('collabExpiryTime', time.toISOString());
  },
  collabEnding: sessionStorage.getItem('collabEnding') == 'true',
  setCollabEnding: (value) => {
    set({ collabEnding: value });
    sessionStorage.setItem('collabEnding', JSON.stringify(value));
  },
}));

export const useCollabStore = createSelectors(useCollabStoreBase);
