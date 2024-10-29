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
  onUpdate: (updatedData: UpdateUserDto, field: 'username' | 'email') => void;
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
  const usernameForm = useZodForm({
    schema: updateUserSchema.pick({ username: true }),
    defaultValues: { username: user?.username },
  });
  const emailForm = useZodForm({
    schema: updateUserSchema.pick({ email: true }),
    defaultValues: { email: user?.email },
  });

  async function handleUpdate(data: string, field: 'username' | 'email') {
    const updatedData = {
      id: user?.id,
      username: field == 'username' ? data : user?.username,
      email: field == 'email' ? data : user?.email,
    };
    onUpdate(updatedData, field);
  }

  function handleCancel(field: 'username' | 'email') {
    if (field == 'username') {
      usernameForm.reset();
      setIsEditingUsername(false);
    } else {
      emailForm.reset();
      setIsEditingEmail(false);
    }
  }

  return (
    <div className="flex flex-col justify-center gap-6 my-3">
      <Form {...usernameForm}>
        <form>
          <FormField
            control={usernameForm.control}
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
                  </div>
                  {isEditingUsername ? (
                    <>
                      <Button
                        type="button"
                        onClick={usernameForm.handleSubmit((data) =>
                          handleUpdate(data.username, 'username'),
                        )}
                        disabled={confirmLoading}
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
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Form {...emailForm}>
        <form>
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-6">
                <FormLabel className="flex text-base min-w-20">Email</FormLabel>
                <div className="flex flex-row justify-center gap-3">
                  <div className="flex flex-col items-center gap-3">
                    <FormControl>
                      <Input
                        disabled={!isEditingEmail}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  {isEditingEmail ? (
                    <>
                      <Button
                        type="button"
                        onClick={emailForm.handleSubmit((data) =>
                          handleUpdate(data.email, 'email'),
                        )}
                        disabled={confirmLoading}
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
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
