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
  FormMessage,
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
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold">User Profile</h1>
      <div className="flex shadow-xl border rounded-3xl space-x-20 p-8 my-8">
        <Avatar className="w-64 h-64">
          <AvatarImage />
          <AvatarFallback className="text-6xl">
            {user?.username[0]}
          </AvatarFallback>
        </Avatar>
        <Form {...form}>
          <form className="flex flex-col justify-center space-y-8 w-1/2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-4">
                    <FormLabel className="w-36 text-base">Username</FormLabel>
                    <FormControl className="flex-grow">
                      <Input
                        defaultValue={user?.username}
                        disabled={!isEditingUsername}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="flex space-x-2 w-28">
                      {isEditingUsername ? (
                        <>
                          <Button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white"
                            onClick={() => handleUpdate('username')}
                          >
                            Save
                          </Button>
                          <Button onClick={handleCancelUsername}>Cancel</Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white"
                          onClick={() => setIsEditingUsername(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-4">
                    <FormLabel className="w-36 text-base">Email</FormLabel>
                    <FormControl className="flex-grow">
                      <Input
                        defaultValue={user?.email}
                        disabled={!isEditingEmail}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="flex space-x-2 w-28">
                      {isEditingEmail ? (
                        <>
                          <Button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white"
                            onClick={() => handleUpdate('email')}
                          >
                            Save
                          </Button>
                          <Button onClick={handleCancelEmail}>Cancel</Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white"
                          onClick={() => setIsEditingEmail(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={() => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="w-28 text-base">Password</FormLabel>
                    <Button
                      type="button"
                      className="w-min bg-blue-500 hover:bg-blue-700"
                      onClick={() => setChangePasswordModalOpen(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="button"
              className="w-1/3 bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Profile
            </Button>
          </form>
        </Form>
      </div>
      {user && (
        <ActionModals
          id={user.id}
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
