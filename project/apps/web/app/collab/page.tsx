'use client';

import  Editor, { Monaco, useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import { MonacoBinding } from 'y-monaco';
import YPartyKitProvider from 'y-partykit/provider';
import * as Y from 'yjs';

export default function CollabPage() {
  const monaco = useMonaco();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (monaco) {
        // create a yew yjs doc
        const ydoc = new Y.Doc();
        // establish partykit as your websocket provider
        const provider = new YPartyKitProvider(
          'ws://localhost:1234',
          'nextjs-monaco-demo',
          ydoc,
        );

        // get the text from the monaco editor
        const yText = ydoc.getText('monaco');
        // // get the monaco editor
        const editor = monaco.editor.getEditors()[0];
        // create the monaco binding to the yjs doc
        if (editor) {
          new MonacoBinding(
            yText,
            editor.getModel()!,
            // @ts-expect-error TODO: fix this
            new Set([editor]),
            provider.awareness,
          );
        }
      }
    }
  }, [monaco]);
  return (
    <div className="p-5">
      <Editor
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// what good shall we do this day?"
        className="bg-background h-[720px] shadow-lg"
      />
    </div>
  );
}
