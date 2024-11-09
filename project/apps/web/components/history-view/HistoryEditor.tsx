import { Editor } from '@monaco-editor/react';
import { AttemptDto } from '@repo/dtos/attempt';
import { useEffect, useRef } from 'react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import { useHistoryStore } from '@/stores/useHistoryStore';

import { EditorAreaSkeleton } from './HistoryEditorSkeleton';

const HistoryEditor = () => {
  const editorRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const selectedAttempt = useHistoryStore.use.selectedAttempt();
  const confirmLoading = useHistoryStore.use.confirmLoading();

  useEffect(() => {
    // Cleanup previous bindings/documents
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
  }, [selectedAttempt]); // reload the editor when the selected attempt changes

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    if (typeof window !== 'undefined') {
      if (!selectedAttempt) {
        editorRef.current.setValue(
          '// Please refresh the page later, your code may take some time to save from your collaboration session.',
        );
        return;
      }

      if (selectedAttempt.code) {
        // raw text, use setValue
        editorRef.current.setValue(selectedAttempt.code);
      } else if (selectedAttempt.document) {
        // Yjs document, use Yjs
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;
        const yText = ydoc.getText('monaco');
        const parsedData = new Uint8Array(selectedAttempt.document);
        Y.applyUpdate(ydoc, parsedData);
        const binding = new MonacoBinding(
          yText,
          editor.getModel(),
          new Set([editor]),
        );
        bindingRef.current = binding;
      }
    }
  };

  if (confirmLoading) {
    return (
      <div className="flex items-start justify-start w-full h-full">
        <EditorAreaSkeleton />
      </div>
    );
  }

  return (
    <div>
      {/* Monaco Editor */}
      <div className="flex flex-col h-[calc(100vh-385px)] border border-1 rounded-md shadow-md">
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

      {/* Output Area */}
      <div className="flex flex-col mt-8 h-[184px] border border-1 rounded-md shadow-md">
        <div className="px-6 py-4 font-semibold border-b border-gray-300">
          Output
        </div>
        <div className="h-full px-6 py-4 overflow-auto whitespace-pre-wrap">
          {selectedAttempt?.output}
        </div>
      </div>
    </div>
  );
};

export default HistoryEditor;
