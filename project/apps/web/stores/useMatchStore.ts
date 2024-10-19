import { create } from 'zustand';

interface StoreState {
  isMatching: boolean;
  setIsMatching: (isMatching: boolean) => void;
}

const useMatchStore = create<StoreState>((set) => ({
  isMatching: false,
  setIsMatching: (isMatching: boolean) => set({ isMatching }),
}));

export default useMatchStore;
