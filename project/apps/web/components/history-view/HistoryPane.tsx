import { CollabInfoWithDocumentDto } from '@repo/dtos/collab';
import { Code, FolderClock } from 'lucide-react';
import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import HistoryEditor from './HistoryEditor';
import { SnapshotTable } from './snapshot-table/SnapshotTable';

interface HistoryPaneProps {
  collab: CollabInfoWithDocumentDto;
  className?: string;
}

const HistoryPane = ({ collab, className }: HistoryPaneProps) => {
  const [toggleValue, setToggleValue] = useState('Code');

  return (
    <div className={className}>
      <div className="flex flex-col">
        {/* Code and Attempts View Toggle */}
        <ToggleGroup
          type="single"
          onValueChange={setToggleValue}
          value={toggleValue}
          className="self-start pb-2"
        >
          <ToggleGroupItem value={'Code'}>
            <Code />
            Code
          </ToggleGroupItem>
          <ToggleGroupItem value={'Attempts'}>
            <FolderClock />
            Attempts
          </ToggleGroupItem>
        </ToggleGroup>
        {/* Code Viewer */}
        {toggleValue === 'Code' && <HistoryEditor collab={collab} />}
        {/* Attempts Viewer */}
        {/* TODO: suspense fallback */}
        {toggleValue === 'Attempts' && <SnapshotTable collab={collab} />}
      </div>
    </div>
  );
};

export default HistoryPane;
