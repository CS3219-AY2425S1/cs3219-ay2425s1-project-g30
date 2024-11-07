'use client';

import { CollabTable } from '@/components/collab/collab-table/CollabTable';

export function HistoryTable() {
  return <CollabTable showEndedSessions={true} />;
}
