'use client';

import { ROLE } from '@repo/dtos/generated/enums/auth.enums';
import { UpdateQuestionDto } from '@repo/dtos/questions';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useZodForm } from '@/lib/form';
import { useQuestionsStore } from '@/stores/useQuestionStore';
import { renderLabelWithAsterisk } from '@/utils/renderLabelWithAsterisk';
import { UpdateUserDto, updateUserSchema } from '@repo/dtos/users';
import { useManageUsersStore } from '@/stores/useManageUsersStore';

interface UpdateModalProps {
  onSubmit: (data: UpdateUserDto) => void;
  initialValues: UpdateUserDto;
}

const UpdateModal = ({ onSubmit, initialValues }: UpdateModalProps) => {
  const isUpdateModalOpen = useManageUsersStore.use.isUpdateModalOpen();
  const setUpdateModalOpen = useManageUsersStore.use.setUpdateModalOpen();
  const form = useZodForm({
    schema: updateUserSchema,
    defaultValues: {
      username: initialValues.username,
      email: initialValues.email,
      role: initialValues.role,
    },
  });

  const ROLES = Object.values(ROLE);

  const handleSubmit = (data: UpdateUserDto) => {
    const updatedData: UpdateUserDto = {
      ...data,
      id: initialValues.id,
    };
    onSubmit(updatedData);
  };

  useEffect(() => {
    if (isUpdateModalOpen) {
      form.reset({
        username: initialValues.username,
        email: initialValues.email,
        id: initialValues.id,
      });
    } else {
      form.reset();
      form.clearErrors();
    }
  }, [open, form, initialValues]);

  return (
    <Dialog open={isUpdateModalOpen} onOpenChange={setUpdateModalOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk('Username')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk('Email')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Roles Dropdown */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-black">
                    {renderLabelWithAsterisk('Role')}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUpdateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={Object.keys(form.formState.errors).length !== 0}
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateModal;
