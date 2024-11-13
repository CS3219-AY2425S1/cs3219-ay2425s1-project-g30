import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { UserDataDto } from '@repo/dtos/users';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { signUp, signIn, signOut, me } from '@/lib/api/auth';
import { createSelectors } from '@/lib/zustand';

interface AuthState {
  user: UserDataDto | null;
  signUp: (signUpDto: SignUpDto) => Promise<void>;
  signIn: (signInDto: SignInDto) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStoreBase = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signUp: async (signUpDto: SignUpDto) => {
        const { userData } = await signUp(signUpDto);
        set({ user: userData });
      },
      signIn: async (signInDto: SignInDto) => {
        const { userData } = await signIn(signInDto);
        set({ user: userData });
      },
      signOut: async () => {
        await signOut();
        set({ user: null });
      },
      fetchUser: async () => {
        try {
          set({ user: await me() });
        } catch {
          // If user is not authenticated or tokens expired
          set({ user: null });
        }
      },
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
    },
  ),
);

export const useAuthStore = createSelectors(useAuthStoreBase);
