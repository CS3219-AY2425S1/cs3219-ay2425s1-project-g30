"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useLoginState } from "@/contexts/LoginStateContext";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { me, signOut } from "@/lib/api/auth";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useMe = () => {
  const router = useRouter();
  const { data, error } = useSuspenseQuery({
    queryKey: [QUERY_KEYS.Me],
    queryFn: me,
  });
  const { removeLoginStateFlag } = useLoginState();
  if (error) {
    removeLoginStateFlag();
  }
  const logoutMutation = useMutation({ mutationFn: signOut });

  const logout = useCallback(
    (redirectToSignIn = true) => {
      return logoutMutation.mutate(undefined, {
        onSuccess: async () => {
          removeLoginStateFlag();
          if (redirectToSignIn) {
            await router.push("/auth");
          }
        },
      });
    },
    [logoutMutation, removeLoginStateFlag],
  );

  return { userData: data, logout };
};
