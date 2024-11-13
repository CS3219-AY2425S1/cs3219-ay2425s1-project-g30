import { CollabInfoDto } from '@repo/dtos/collab';
import { create } from 'zustand';

import { endCollab, getCollabInfoById } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';
import { persist } from 'zustand/middleware';

interface CollabState {
  collaboration: CollabInfoDto[];
  initialiseCollab: (id: string) => Promise<void>;
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

export const useCollabStoreBase = create<CollabState>()(
  persist(
    (set) => ({
      collaboration: [],
      initialiseCollab: async (id: string) => {
        const collab = await getCollabInfoById(id);
        set((state) => ({
          collaboration: [...state.collaboration, collab], // Add collaboration in the local storage
        }));
      },

      // For the user who initiated to end the session
      endCollab: async (id: string) => {
        await endCollab(id);
        set((state) => ({
          isEndSessionModalOpen: false,
          collaboration: state.collaboration.filter(
            (collab) => collab.id !== id, // Remove collab from local storage
          ),
        }));
      },
      notifyEndSession: (id: string) => {
        set((state) => ({
          collabEnded: true,
          isNotifyEndCollabModalOpen: true,
          collaboration: state.collaboration.filter(
            (collab) => collab.id !== id, // Remove collab from local storage
          ),
        }));
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
    }),
    {
      name: 'collab-store',
      partialize: (state) => ({ collaboration: state.collaboration }),
    },
  ),
);

export const useCollabStore = createSelectors(useCollabStoreBase);
