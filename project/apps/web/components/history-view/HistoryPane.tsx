'use client';

import { AttemptFiltersDto } from '@repo/dtos/attempt';
import { CollabInfoDto } from '@repo/dtos/collab';
import { Code, FolderClock } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuthStore } from '@/stores/useAuthStore';
import { HistoryPaneView, useHistoryStore } from '@/stores/useHistoryStore';

import { AttemptTable } from './attempt-table/AttemptTable';
import HistoryEditor from './HistoryEditor';

interface HistoryPaneProps {
  collabInfo: CollabInfoDto;
  className?: string;
}

const HistoryPane = ({ collabInfo, className }: HistoryPaneProps) => {
  const user = useAuthStore.use.user();

  const attempts = useHistoryStore.use.attemptCollection();
  const fetchAttempts = useHistoryStore.use.fetchAttempts();
  const historyPaneView = useHistoryStore.use.historyPaneView();
  const setHistoryPaneView = useHistoryStore.use.setHistoryPaneView();

  if (!attempts && user) {
    const filters: AttemptFiltersDto = {
      collab_id: collabInfo.id,
      user_id: user.id,
    };
    fetchAttempts(filters);
  }

  return (
    <div className={className}>
      <div className="flex flex-col">
        {/* Code and Attempts View Toggle */}
        <ToggleGroup
          type="single"
          onValueChange={setHistoryPaneView}
          value={historyPaneView}
          className="self-start pb-2"
        >
          <ToggleGroupItem value={HistoryPaneView.Code}>
            <Code />
            Code
          </ToggleGroupItem>
          <ToggleGroupItem value={HistoryPaneView.Attempts}>
            <FolderClock />
            Attempts
          </ToggleGroupItem>
        </ToggleGroup>
        {/* Code Viewer */}
        {historyPaneView === HistoryPaneView.Code && <HistoryEditor />}
        {/* Attempts Viewer */}
        {/* TODO: suspense fallback */}
        {historyPaneView === HistoryPaneView.Attempts && <AttemptTable />}
      </div>
    </div>
  );
};

export default HistoryPane;
