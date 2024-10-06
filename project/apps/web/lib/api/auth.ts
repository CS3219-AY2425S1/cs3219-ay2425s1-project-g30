import { create } from "zustand";
import { apiCall } from "./apiClient";
import { SignInDto, SignUpDto } from "@repo/dtos/auth";
import { persist } from "zustand/middleware";
import { UserDetails } from '../../../api-gateway/src/supabase/collection';

interface AuthState {
  user: UserDetails | null;
  signUp: (signUpDto: SignUpDto) => Promise<void>;
  signIn: (signInDto: SignInDto) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      
      signUp: async (signUpDto: SignUpDto) => {
        await apiCall<void>("post", "/auth/signup", signUpDto);
        await (get() as AuthState).fetchUser();
      },
      signIn: async (signInDto: SignInDto) => {
        await apiCall<void>("post", "/auth/signin", signInDto),
        await (get() as AuthState).fetchUser();
      },
      signOut: async () => {
        await apiCall<void>("post", "/auth/signout");
        set({ user: null });
      },
      fetchUser: async () => {
        const userData = await apiCall<UserDetails>("get", "/auth/me");
        set({ user: userData });
      },
      refreshAccessToken: async () => {
        await apiCall<void>("post", "/auth/refresh-token");
      },
    }),
    {
      name: "auth_storage",
    }
  )
);
