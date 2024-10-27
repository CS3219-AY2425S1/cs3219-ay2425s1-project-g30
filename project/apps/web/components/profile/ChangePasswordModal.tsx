'use client';

import { ChangePasswordDto, changePasswordSchema } from '@repo/dtos/users';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useZodForm } from '@/lib/form';
import { useProfileStore } from '@/stores/useProfileStore';

interface ChangePasswordModalProps {
  onSubmit: (data: ChangePasswordDto) => void;
  userId: string;
}

export default function ChangePasswordModal({
  onSubmit,
  userId,
}: ChangePasswordModalProps) {
  const confirmLoading = useProfileStore.use.confirmLoading();
  const isChangePasswordModalOpen =
    useProfileStore.use.isChangePasswordModalOpen();
  const setChangePasswordModalOpen =
    useProfileStore.use.setChangePasswordModalOpen();

  const form = useZodForm({
    schema: changePasswordSchema,
    defaultValues: {
      id: userId,
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleSubmit = (values: ChangePasswordDto) => {
    const updatedData: ChangePasswordDto = {
      ...values,
      id: userId,
    };
    onSubmit(updatedData);
  };

  useEffect(() => {
    if (isChangePasswordModalOpen) {
      form.reset({
        id: userId,
        newPassword: '',
        confirmNewPassword: '',
      });
    } else {
      form.reset();
      form.clearErrors();
    }
  }, [isChangePasswordModalOpen, form, userId]);

  return (
    <Dialog
      open={isChangePasswordModalOpen}
      onOpenChange={setChangePasswordModalOpen}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password Field */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password again"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordModalOpen(false)}
                disabled={confirmLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  Object.keys(form.formState.errors).length !== 0 ||
                  confirmLoading
                }
              >
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
