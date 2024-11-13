'use client';

import { signInSchema, SignInDto } from '@repo/dtos/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

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
import { useToast } from '@/hooks/use-toast';
import { useZodForm } from '@/lib/form';
import { useAuthStore } from '@/stores/useAuthStore';

export function SignInForm() {
  const form = useZodForm({
    schema: signInSchema,
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const signIn = useAuthStore.use.signIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mutation = useMutation({
    mutationFn: (values: SignInDto) => signIn(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Me] });
      await router.push(searchParams.get('callbackUrl') || '/');
    },
    onError(error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });
  function onSubmit(values: SignInDto) {
    mutation.mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
