'use client';

import { UpdateUserDto, updateUserSchema } from '@repo/dtos/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Suspense, useState } from 'react';

import { ActionModals } from '@/components/profile/ActionModals';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  ProfileStateProvider,
  useProfileState,
} from '@/contexts/ProfileStateContext';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/api/users';
import { useZodForm } from '@/lib/form';
import { useAuthStore } from '@/stores/useAuthStore';

import ProfileSkeleton from './components/ProfileSkeleton';

const ProfilePageContent = () => {
  const user = useAuthStore.use.user();
  const form = useZodForm({ schema: updateUserSchema });
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const {
    confirmLoading,
    setConfirmLoading,
    isChangePasswordModalOpen,
    isDeleteModalOpen,
    setChangePasswordModalOpen,
    setDeleteModalOpen,
  } = useProfileState();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (updatedUser: UpdateUserDto) => updateUser(updatedUser),
    onMutate: () => setConfirmLoading(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Me] });
      setIsEditingUsername(false);
      setIsEditingEmail(false);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'User updated successfully',
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

  async function handleUpdate(field: 'username' | 'email') {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User data not available',
        variant: 'error',
      });
      return;
    }

    const newUsername = form.getValues('username') ?? user.username;
    const newEmail = form.getValues('email') ?? user.email;

    const updatedData = {
      id: user.id,
      username: field === 'username' ? newUsername : user?.username,
      email: field === 'email' ? newEmail : user?.email,
    };

    mutation.mutate(updatedData);
  }

  function handleCancelUsername() {
    form.setValue('username', user?.username);
    setIsEditingUsername(false);
  }

  function handleCancelEmail() {
    form.setValue('email', user?.email);
    setIsEditingEmail(false);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-start items-center my-5">
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>
      <div className="flex flex-row shadow-md border border-gray-200 rounded-lg gap-8 p-8 my-8">
        <Avatar className="w-16 h-16">
          <AvatarImage />
          <AvatarFallback className="text-xl">
            {user?.username[0]}
          </AvatarFallback>
        </Avatar>
        <Form {...form}>
          <form className="flex flex-col justify-center gap-6 my-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-6">
                  <FormLabel className="flex text-base min-w-20">
                    Username
                  </FormLabel>
                  <div className="flex flex-row justify-center gap-3">
                    <FormControl>
                      <Input
                        defaultValue={user?.username}
                        disabled={!isEditingUsername}
                        {...field}
                      />
                    </FormControl>
                    {isEditingUsername ? (
                      <>
                        <Button
                          type="button"
                          disabled={confirmLoading}
                          onClick={() => handleUpdate('username')}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelUsername}
                          variant="outline"
                          disabled={confirmLoading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        disabled={confirmLoading}
                        onClick={() => setIsEditingUsername(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-6">
                  <FormLabel className="text-base min-w-20">Email</FormLabel>
                  <div className="flex flex-row justify-center gap-3">
                    <FormControl>
                      <Input
                        defaultValue={user?.email}
                        disabled={!isEditingEmail}
                        {...field}
                      />
                    </FormControl>
                    {isEditingEmail ? (
                      <>
                        <Button
                          type="button"
                          disabled={confirmLoading}
                          onClick={() => handleUpdate('email')}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEmail}
                          variant="outline"
                          disabled={confirmLoading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        disabled={confirmLoading}
                        onClick={() => setIsEditingEmail(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={() => (
                <FormItem className="flex flex-row items-center gap-6">
                  <FormLabel className="text-base min-w-20">Password</FormLabel>
                  <Button
                    type="button"
                    className="min-w-[174px]"
                    disabled={confirmLoading}
                    onClick={() => setChangePasswordModalOpen(true)}
                  >
                    Change Password
                  </Button>
                </FormItem>
              )}
            />
            <Button
              type="button"
              disabled={confirmLoading}
              className="max-w-[144px] bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </form>
        </Form>
      </div>
      {user && (
        <ActionModals
          user={user}
          setConfirmLoading={setConfirmLoading}
          isChangePasswordModalOpen={isChangePasswordModalOpen}
          setChangePasswordModalOpen={setChangePasswordModalOpen}
          isDeleteModalOpen={isDeleteModalOpen}
          setDeleteModalOpen={setDeleteModalOpen}
        />
      )}
    </div>
  );
};

const ProfilePage = () => {
  return (
    <ProfileStateProvider>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfilePageContent />
      </Suspense>
    </ProfileStateProvider>
  );
};

export default ProfilePage;
