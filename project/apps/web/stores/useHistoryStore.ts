import {
  AttemptCollectionDto,
  AttemptDto,
  AttemptFiltersDto,
} from '@repo/dtos/attempt';
import { create } from 'zustand';

import { getAttempts } from '@/lib/api/collab';
import { createSelectors } from '@/lib/zustand';

export enum HistoryPaneView {
  Code = 'Code',
  Attempts = 'Attempts',
}

interface HistoryState {
  attemptCollection: AttemptCollectionDto | null;
  fetchAttempts: (filters: AttemptFiltersDto) => Promise<AttemptCollectionDto>;
  selectedAttempt: AttemptDto | null;
  setSelectedAttempt: (value: AttemptDto) => void;
  confirmLoading: boolean;

  historyPaneView: HistoryPaneView;
  setHistoryPaneView: (value: HistoryPaneView) => void;
}

const useHistoryStoreBase = create<HistoryState>((set) => ({
  attemptCollection: null,
  selectedAttempt: null,
  confirmLoading: false,
  fetchAttempts: async (filters: AttemptFiltersDto) => {
    try {
      set({ confirmLoading: true });
      const attempts = await getAttempts(filters);
      set({ attemptCollection: attempts });
      const finalSubmission = attempts?.attempts.find(
        (a) => a.id === filters.collab_id,
      );
      if (finalSubmission) {
        set({ selectedAttempt: finalSubmission });
      }
      return attempts;
    } finally {
      set({ confirmLoading: false });
    }
  },
  setSelectedAttempt: (value) => set({ selectedAttempt: value }),
  historyPaneView: HistoryPaneView.Code,
  setHistoryPaneView: (value) => set({ historyPaneView: value }),
}));

export const useHistoryStore = createSelectors(useHistoryStoreBase);
