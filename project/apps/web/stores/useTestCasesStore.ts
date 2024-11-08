import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand';
import { CreateTestCasesDto } from '@repo/dtos/testCases';

interface TestCasesState {
  testCases: CreateTestCasesDto['cases'];
  schema: CreateTestCasesDto['schema'];
  testCasesId: string | null;
  setTestCases: (cases: CreateTestCasesDto['cases']) => void;
  setSchema: (schema: CreateTestCasesDto['schema']) => void;
  setTestCasesId: (id: string | null) => void;
}

export const useTestCasesStoreBase = create<TestCasesState>((set) => ({
  testCases: [],
  schema: { type: 'object', properties: {}, required: [] },
  testCasesId: null,
  setTestCases: (cases) => set({ testCases: cases }),
  setSchema: (schema) => set({ schema }),
  setTestCasesId: (id) => set({ testCasesId: id }),
}));

export const useTestCasesStore = createSelectors(useTestCasesStoreBase);
