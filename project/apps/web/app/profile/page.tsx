'use client';

import { UpdateUserDto } from '@repo/dtos/users';
import { useMutation } from '@tanstack/react-query';
import { Suspense } from 'react';

import { ActionModals } from '@/components/profile/ActionModals';
import ProfileDetails from '@/components/profile/ProfileDetails';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/api/users';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';

import ProfileSkeleton from '@/components/profile/ProfileSkeleton';

const ProfilePageContent = () => {
  const user = useAuthStore.use.user();
  if (!user) return;
  const fetchUser = useAuthStore.use.fetchUser();
  const confirmLoading = useProfileStore.use.confirmLoading();
  const setConfirmLoading = useProfileStore.use.setConfirmLoading();
  const setIsEditingUsername = useProfileStore.use.setIsEditingUsername();
  const setIsEditingEmail = useProfileStore.use.setIsEditingEmail();
  const setChangePasswordModalOpen =
    useProfileStore.use.setChangePasswordModalOpen();
  const setDeleteModalOpen = useProfileStore.use.setDeleteModalOpen();

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: {
      updatedUser: UpdateUserDto;
      field: 'username' | 'email';
    }) => updateUser(data.updatedUser),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async (updatedUserData, data) => {
      data.field == 'username'
        ? setIsEditingUsername(false)
        : setIsEditingEmail(false);
      toast({
        variant: 'success',
        title: 'Success',
        description: `User's ${data.field} updated successfully`,
      });
    },
    onSettled: () => {
      fetchUser();
      setConfirmLoading(false);
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: 'error',
        title: 'Error',
      });
    },
  });

  async function handleUpdate(
    updatedUser: UpdateUserDto,
    field: 'username' | 'email',
  ) {
    mutation.mutate({ updatedUser, field });
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-start my-5">
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>
      <div className="flex flex-col gap-8 p-8 my-8 border border-gray-200 rounded-lg shadow-md">
        <div className="flex flex-row items-center gap-9">
          <Avatar className="w-32 h-32">
            <AvatarImage />
            <AvatarFallback className="text-xl">
              {user?.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-3 items-left">
            <ProfileDetails user={user} onUpdate={handleUpdate} />
            <div className="flex flex-row items-center gap-6">
              <p className="text-base font-medium min-w-20 text-bold">
                Password
              </p>
              <Button
                type="button"
                className="min-w-[174px]"
                disabled={confirmLoading}
                onClick={() => setChangePasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>
            <Button
              type="button"
              disabled={confirmLoading}
              className="max-w-[144px] my-3 bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
      {user && <ActionModals user={user} />}
    </div>
  );
};

const ProfilePage = () => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
};

export default ProfilePage;
