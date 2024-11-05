'use client';

import { Editor } from '@monaco-editor/react';
import { CollabInfoWithDocumentDto } from '@repo/dtos/collab';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense, useRef } from 'react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { fetchCollaHistorybById } from '@/lib/api/collab';
import { useAuthStore } from '@/stores/useAuthStore';

interface HistoryViewProps {
  params: {
    id: string;
  };
}

const HistoryViewContent = ({ id }: { id: string }) => {
  const user = useAuthStore.use.user();
  const editorRef = useRef<any>(null);
  const ydocRef = useRef(new Y.Doc());

  const { data: collab } = useSuspenseQuery<CollabInfoWithDocumentDto>({
    queryKey: [QUERY_KEYS.Collab, id],
    queryFn: () => fetchCollaHistorybById(id),
  });

  if (!collab) {
    return notFound();
  }

  const userName =
    collab.collab_user1.id == user?.id
      ? collab.collab_user2.username
      : collab.collab_user1.username;
  const question = {
    title: collab.question.q_title || 'Untitled Question',
    description: collab.question.q_desc || 'No description',
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    if (typeof window !== 'undefined') {
      const ydoc = ydocRef.current;

      // Load Yjs document from collab data
      if (!collab.document?.data) {
        const parsedData = new Uint8Array(collab.document.data);
        Y.applyUpdate(ydoc, parsedData);
      }

      // Bind Monaco editor to Yjs document
      const yText = ydoc.getText('monaco');
      new MonacoBinding(yText, editor.getModel(), new Set([editor]));
    }
  };

  return (
    <div className="h-screen px-8 py-4">
      {/* Header with Back button */}
      <div className="flex items-center mb-4">
        <Button
          variant="link"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-md">Collaboration Partner</span>
        <span className="ml-1 mr-2 font-semibold text-md">{userName}</span>
        <Avatar className="w-8 h-8">
          <AvatarImage />
          <AvatarFallback>{user?.username[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex gap-8 max-h-fit">
        {/* Question info */}
        <div className="w-1/2 h-[calc(100vh-120px)] p-6 border border-1 rounded-md shadow-md bg-white">
          <h2 className="mb-4 text-xl font-semibold">{question.title}</h2>
          <p>{question.description}</p>
        </div>
        {/* Code editor */}
        <div className="w-full p-6">
          <Editor
            theme="vs-dark"
            // defaultLanguage={selectedRuntime?.language || 'javascript'}
            defaultLanguage="javascript"
            // TODO: uncomment this after jon's PR is merged to use EditorAreaSkeleton
            // loading={
            //   <div className="flex items-start justify-start w-full h-full">
            //     <EditorAreaSkeleton />
            //   </div>
            // }
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              readOnly: true,
              automaticLayout: true,
              quickSuggestions: { other: true, comments: false, strings: true },
            }}
            className="w-full"
          />
        </div>
      </div>
      {/* TODO: consider supporting running of code */}
      {/* {collabInfo && <ActionModals collabId={id} />} */}
    </div>
  );
};

const HistoryView = ({ params }: HistoryViewProps) => {
  const { id } = params;
  return (
    // todo: add fallback=CollabSkeleton from jon's PR
    <Suspense>
      <HistoryViewContent id={id} />
    </Suspense>
  );
};

export default HistoryView;
