'use client';

import { UserDataDto, ChangePasswordDto } from '@repo/dtos/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import DeleteModal from '@/components/profile/DeleteModal';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { changePassword, deleteUser } from '@/lib/api/users';

interface ActionModalsProps {
  id: string;
  user: UserDataDto;
  setConfirmLoading: (val: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setChangePasswordModalOpen: (val: boolean) => void;
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (val: boolean) => void;
}

export const ActionModals = ({
  id,
  user,
  setConfirmLoading,
  isChangePasswordModalOpen,
  setChangePasswordModalOpen,
  isDeleteModalOpen,
  setDeleteModalOpen,
}: ActionModalsProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { toast } = useToast();

  const editMutation = useMutation({
    mutationFn: (updatedPassword: ChangePasswordDto) =>
      changePassword(updatedPassword),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
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
        queryKey: [QUERY_KEYS.Me, id],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Me] });
      setDeleteModalOpen(false);
      router.push('/');
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
    editMutation.mutate(updatedPassword);
  };

  const handleDeleteUser = () => {
    deleteMutation.mutate(id);
  };

  return (
    <>
      {user && (
        <ChangePasswordModal
          open={isChangePasswordModalOpen}
          setOpen={setChangePasswordModalOpen}
          onSubmit={handleChangePassword}
          userId={user.id}
        />
      )}

      {user && (
        <DeleteModal
          open={isDeleteModalOpen}
          setOpen={setDeleteModalOpen}
          onDelete={handleDeleteUser}
          username={user.username}
        />
      )}
    </>
  );
};
