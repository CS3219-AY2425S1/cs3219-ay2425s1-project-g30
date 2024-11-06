import { Editor } from '@monaco-editor/react';
import { CollabInfoWithDocumentDto } from '@repo/dtos/collab';
import { useRef } from 'react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import { EditorAreaSkeleton } from './HistoryEditorSkeleton';

interface HistoryEditorProps {
  collab: CollabInfoWithDocumentDto;
  className?: string;
}

const HistoryEditor = ({ collab, className }: HistoryEditorProps) => {
  const editorRef = useRef<any>(null);
  const ydocRef = useRef(new Y.Doc());

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    if (typeof window !== 'undefined') {
      const ydoc = ydocRef.current;

      // Load Yjs document from collab data
      if (collab.document_data) {
        const parsedData = new Uint8Array(collab.document_data);
        Y.applyUpdate(ydoc, parsedData);
      }

      // Bind Monaco editor to Yjs document
      const yText = ydoc.getText('monaco');
      new MonacoBinding(yText, editor.getModel(), new Set([editor]));
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col h-[calc(100vh-336px)] border border-1 rounded-md shadow-md">
        {/* Monaco Editor */}
        <div className="flex h-full p-6">
          <Editor
            theme="light"
            // Potential enhancement: persist the language of the document and use it here
            defaultLanguage="plaintext"
            loading={
              <div className="flex items-start justify-start w-full h-full">
                <EditorAreaSkeleton />
              </div>
            }
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              readOnly: true,
              automaticLayout: true,
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryEditor;
