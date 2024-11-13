'use client';

import { CollabTable } from '@/components/collab/collab-table/CollabTable';

export function SessionsTable() {
  return <CollabTable showEndedSessions={false} />;
}
