'use client';

import { QuestionDto } from '@repo/dtos/questions';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

type QuestionsStateContextReturn = {
  selectedQuestion: QuestionDto | null;
  setSelectedQuestion: (val: QuestionDto | null) => void;
  confirmLoading: boolean;
  setConfirmLoading: (val: boolean) => void;
  isEditModalOpen: boolean;
  setEditModalOpen: (val: boolean) => void;
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (val: boolean) => void;
};

const QuestionsStateContext = createContext<QuestionsStateContextReturn | null>(
  null,
);

/**
 * Provider component that wraps your app and makes client login state boolean available
 * to any child component that calls `useQuestionsState()`.
 */
export const QuestionsStateProvider = ({ children }: PropsWithChildren) => {
  const questionsState = useProvideQuestionsState();

  return (
    <QuestionsStateContext.Provider value={questionsState}>
      {children}
    </QuestionsStateContext.Provider>
  );
};

/**
 * Hook for components nested in QuestionsStateProvider component to get the current login state.
 */
export const useQuestionsState = (): QuestionsStateContextReturn => {
  const context = useContext(QuestionsStateContext);
  if (!context) {
    throw new Error(
      `useQuestionsState must be used within a QuestionsStateProvider component`,
    );
  }
  return context;
};

const useProvideQuestionsState = () => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDto | null>(
    null,
  );
  return {
    selectedQuestion,
    setSelectedQuestion,
    isEditModalOpen,
    setEditModalOpen,
    isDeleteModalOpen,
    setDeleteModalOpen,
    confirmLoading,
    setConfirmLoading,
  };
};
