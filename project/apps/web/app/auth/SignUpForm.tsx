"use client";

import { signUpSchema, SignUpDto } from "@repo/dtos/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useZodForm } from "@/lib/form";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/AuthStore";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const form = useZodForm({ schema: signUpSchema });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const signUp = useAuthStore.use.signUp();
  const router = useRouter();
  
  const mutation = useMutation({
    mutationFn: (values: SignUpDto) => signUp(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.Me] });
      await router.push("/questions");
    },
    onError: (error) => {
      toast({
        description: error.message,
        variant: "error",
        title: "Error",
      });
    },
  });
  async function onSubmit(values: SignUpDto) {
    mutation.mutate(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
