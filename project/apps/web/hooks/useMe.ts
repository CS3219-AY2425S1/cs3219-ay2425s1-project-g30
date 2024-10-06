"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/api/auth";

export const useMe = () => {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [fetchUser, user]);

  const logoutMutation = useMutation({ 
    mutationFn: signOut,
    onSuccess: async () => await router.push("/auth")
  });

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          if (redirectToSignIn) {
            await router.push("/auth");
          }
        },
      });
    },
    [logoutMutation, user],
  );

  return { userData: user, logout };
};
