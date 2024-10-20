'use client';

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

type ProfileStateContextReturn = {
  confirmLoading: boolean;
  setConfirmLoading: (val: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setChangePasswordModalOpen: (val: boolean) => void;
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (val: boolean) => void;
};

const ProfileStateContext = createContext<ProfileStateContextReturn | null>(
  null,
);

/**
 * Provider component that wraps your app and makes client login state boolean available
 * to any child component that calls `useQuestionsState()`.
 */
export const ProfileStateProvider = ({ children }: PropsWithChildren) => {
  const profileState = useProvideProfileState();

  return (
    <ProfileStateContext.Provider value={profileState}>
      {children}
    </ProfileStateContext.Provider>
  );
};

/**
 * Hook for components nested in QuestionsStateProvider component to get the current login state.
 */
export const useProfileState = (): ProfileStateContextReturn => {
  const context = useContext(ProfileStateContext);
  if (!context) {
    throw new Error(
      `useProfileState must be used within a ProfileStateProvider component`,
    );
  }
  return context;
};

const useProvideProfileState = () => {
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  return {
    isChangePasswordModalOpen,
    setChangePasswordModalOpen,
    isDeleteModalOpen,
    setDeleteModalOpen,
    confirmLoading,
    setConfirmLoading,
  };
};
