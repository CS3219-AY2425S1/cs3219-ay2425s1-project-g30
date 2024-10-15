"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/AuthStore";

export const useMe = () => {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const fetchUser = useAuthStore.use.fetchUser();
  const signOut = useAuthStore.use.signOut();

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
