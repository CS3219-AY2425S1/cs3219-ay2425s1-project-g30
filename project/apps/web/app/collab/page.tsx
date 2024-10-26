'use client';

import { HocuspocusProvider } from '@hocuspocus/provider';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import { env } from '@/env.mjs';

export default function CollabPage() {
  const monaco = useMonaco();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (monaco) {
        const ydoc = new Y.Doc();

        const provider = new HocuspocusProvider({
          url: env.NEXT_PUBLIC_COLLAB_SOCKET_URL,
          name: 'nextjs-monaco-demo',
          document: ydoc,
        });

        const yText = ydoc.getText('monaco');

        const editor = monaco.editor.getEditors()[0];
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
