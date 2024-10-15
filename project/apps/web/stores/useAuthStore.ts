import { SignInDto, SignUpDto } from '@repo/dtos/auth';
import { UserDataDto } from '@repo/dtos/users';
import { create } from 'zustand';

import { signUp, signIn, signOut, me } from '@/lib/api/auth';
import { createSelectors } from '@/lib/zustand';

interface AuthState {
  user: UserDataDto | null;
  signUp: (signUpDto: SignUpDto) => Promise<void>;
  signIn: (signInDto: SignInDto) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const useAuthStoreBase = create<AuthState>()((set) => ({
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
    const userData = await me();
    set({ user: userData });
  },
}));

export const useAuthStore = createSelectors(useAuthStoreBase);
