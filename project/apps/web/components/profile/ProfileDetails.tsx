import { UpdateUserDto, updateUserSchema, UserDataDto } from '@repo/dtos/users';

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
import { useZodForm } from '@/lib/form';
import { useProfileStore } from '@/stores/useProfileStore';

interface ProfileDetailsProps {
  user: UserDataDto;
  onUpdate: (updatedData: UpdateUserDto) => void;
}

export default function ProfileDetails({
  user,
  onUpdate,
}: ProfileDetailsProps) {
  const isEditingUsername = useProfileStore.use.isEditingUsername();
  const setIsEditingUsername = useProfileStore.use.setIsEditingUsername();
  const isEditingEmail = useProfileStore.use.isEditingEmail();
  const setIsEditingEmail = useProfileStore.use.setIsEditingEmail();
  const confirmLoading = useProfileStore.use.confirmLoading();
  const form = useZodForm({
    schema: updateUserSchema,
    defaultValues: {
      username: user?.username,
      email: user?.email,
    },
  });

  async function handleUpdate(field: 'username' | 'email') {
    const updatedData = {
      id: user.id,
      username:
        field == 'username' ? form.getValues('username') : user.username,
      email: field == 'email' ? form.getValues('email') : user.email,
    };
    onUpdate(updatedData);
  }

  function handleCancel(field: 'username' | 'email') {
    form.reset({ [field]: user?.[field] });
    field == 'username'
      ? setIsEditingUsername(false)
      : setIsEditingEmail(false);
  }

  return (
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
                <div className="flex flex-col items-center gap-3">
                  <FormControl>
                    <Input
                      disabled={!isEditingUsername}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
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
                      onClick={() => handleCancel('username')}
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
                <div className="flex flex-col items-center gap-3">
                  <FormControl>
                    <Input
                      disabled={!isEditingEmail}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
                {isEditingEmail ? (
                  <>
                    <Button
                      type="button"
                      disabled={Object.keys(form.formState.errors).length !== 0}
                      onClick={() => handleUpdate('email')}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => handleCancel('email')}
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
      </form>
    </Form>
  );
}
