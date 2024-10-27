'use client';

import { UserDataDto, ChangePasswordDto } from '@repo/dtos/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import DeleteModal from '@/components/profile/DeleteModal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { changePassword, deleteUser } from '@/lib/api/users';
import { useProfileStore } from '@/stores/useProfileStore';

interface ActionModalsProps {
  user: UserDataDto;
}

export const ActionModals = ({ user }: ActionModalsProps) => {
  const setConfirmLoading = useProfileStore.use.setConfirmLoading();
  const setChangePasswordModalOpen =
    useProfileStore.use.setChangePasswordModalOpen();
  const setDeleteModalOpen = useProfileStore.use.setDeleteModalOpen();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { toast } = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: (updatedPassword: ChangePasswordDto) =>
      changePassword(updatedPassword),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Question, user.id],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Me] });
      setChangePasswordModalOpen(false);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Password updated successfully',
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      toast({
        description: error.message,
        variant: 'error',
        title: 'Error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Me, user.id],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Me] });
      setDeleteModalOpen(false);
      router.replace('/'); // replace, not push, to disallow return to deleted user's profile
      toast({
        variant: 'success',
        title: 'Success',
        description: 'User deleted successfully',
      });
    },
    onSettled: () => setConfirmLoading(false),
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleChangePassword = (updatedPassword: ChangePasswordDto) => {
    changePasswordMutation.mutate(updatedPassword);
  };

  const handleDeleteUser = () => {
    deleteMutation.mutate(user.id);
  };

  return (
    <>
      {user && (
        <ChangePasswordModal onSubmit={handleChangePassword} userId={user.id} />
      )}

      {user && (
        <DeleteModal onDelete={handleDeleteUser} username={user.username} />
      )}
    </>
  );
};
