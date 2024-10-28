'use client';

import { UserDataDto, UpdateUserDto } from '@repo/dtos/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import UpdateModal from '@/components/manage-users/UpdateModal';
import DeleteModal from '@/components/manage-users/DeleteModal';
import { useToast } from '@/hooks/use-toast';
import { updateUser, deleteUser } from '@/lib/api/users';
import { useManageUsersStore } from '@/stores/useManageUsersStore';
import { QUERY_KEYS } from '@/constants/queryKeys';

interface ActionModalsProps {
  user: UserDataDto;
}

export const ActionModals = ({ user }: ActionModalsProps) => {
  const setConfirmLoading = useManageUsersStore.use.setConfirmLoading();
  const setUpdateModalOpen = useManageUsersStore.use.setUpdateModalOpen();
  const setDeleteModalOpen = useManageUsersStore.use.setDeleteModalOpen();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: (updatedUser: UpdateUserDto) =>
      updateUser(updatedUser),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Users, updatedUser.id],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Users] });
      
      setUpdateModalOpen(false);
      toast({
        variant: 'success',
        title: 'Success',
        description: `User ${updatedUser.username} updated successfully`,
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
    onSuccess: async (deletedUserId) => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.Users, deletedUserId],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Users] });
      
      setDeleteModalOpen(false);
      router.push('/manage-users');
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

  const handleUpdateUser = (updatedUser: UpdateUserDto) => {
    updateMutation.mutate(updatedUser);
  };

  const handleDeleteUser = () => {
    deleteMutation.mutate(user.id);
  };

  return (
    <>
      {user && (
        <UpdateModal onSubmit={handleUpdateUser} initialValues={user} />
      )}

      {user && (
        <DeleteModal onDelete={handleDeleteUser} username={user.username} />
      )}
    </>
  );
};
