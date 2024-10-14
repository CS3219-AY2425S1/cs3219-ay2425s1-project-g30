import { create, StoreApi, UseBoundStore } from "zustand";
import { SignInDto, SignUpDto } from "@repo/dtos/auth";
import { UserDataDto } from '@repo/dtos/users';
import {
  signUp,
  signIn,
  signOut,
  me,
} from "@/lib/api/auth";

interface AuthState {
  user: UserDataDto | null;
  signUp: (signUpDto: SignUpDto) => Promise<void>;
  signIn: (signInDto: SignInDto) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  let store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }
  
  return store
}

const useAuthStoreBase = create<AuthState>()(
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
      const userData = await me();
      set({ user: userData });
    },
  }),
);

export const useAuthStore = createSelectors(useAuthStoreBase)
