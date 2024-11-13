import { Editor } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import { useHistoryStore } from '@/stores/useHistoryStore';

import { OutputSectionSkeleton } from '../collab/EditorSkeleton';
import TestCasesOutputSection from '../collab/TestCasesOutputSection';

import { EditorAreaSkeleton } from './HistoryEditorSkeleton';

const HistoryEditor = () => {
  const editorRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const selectedAttempt = useHistoryStore.use.selectedAttempt();
  const confirmLoading = useHistoryStore.use.confirmLoading();

  const output = selectedAttempt?.output;

  const testCases = selectedAttempt?.testCasesAndResults?.testCases;
  const testResults = selectedAttempt?.testCasesAndResults?.testResults;

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
        editorRef.current.setValue('// Please select an attempt to view');
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
      } else {
        editorRef.current.setValue(
          `// Please refresh the page later, 
           // your code may take some time to save from your collaboration session.`,
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-442px)] border border-1 rounded-md shadow-md">
      {/* Monaco Editor */}
      <div className="flex h-full p-6">
        <Editor
          theme="light"
          defaultLanguage={selectedAttempt?.language ?? 'plaintext'}
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

      {/* Output Area */}
      {output || testCases ? (
        // Show output / test results if available
        <div className="flex flex-col mt-8 h-[290px] border border-1 rounded-md shadow-md">
          <div className="p-4 font-semibold border-b border-gray-300">
            {testCases ? 'Test Cases' : 'Output'}
          </div>
          {testCases ? (
            <TestCasesOutputSection
              testResults={testResults!}
              testCases={testCases}
            />
          ) : (
            <div className="h-full px-6 py-4 overflow-auto whitespace-pre-wrap">
              {output}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default HistoryEditor;
