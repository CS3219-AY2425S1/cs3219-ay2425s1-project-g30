import { QuestionDto } from '@repo/dtos/questions';
import { create } from 'zustand';

import { createSelectors } from '@/lib/zustand';

interface QuestionsState {
  selectedQuestion: QuestionDto | null;
  setSelectedQuestion: (value: QuestionDto | null) => void;
  confirmLoading: boolean;
  setConfirmLoading: (value: boolean) => void;
  isCreateModalOpen: boolean;
  setCreateModalOpen: (value: boolean) => void;
  isEditModalOpen: boolean;
  setEditModalOpen: (value: boolean) => void;
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (value: boolean) => void;
}

export const useQuestionsStoreBase = create<QuestionsState>((set) => ({
  selectedQuestion: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  confirmLoading: false,
  setSelectedQuestion: (value) => set({ selectedQuestion: value }),
  setCreateModalOpen: (value) => set({ isCreateModalOpen: value }),
  setEditModalOpen: (value) => set({ isEditModalOpen: value }),
  setDeleteModalOpen: (value) => set({ isDeleteModalOpen: value }),
  setConfirmLoading: (value) => set({ confirmLoading: value }),
}));

export const useQuestionsStore = createSelectors(useQuestionsStoreBase);
