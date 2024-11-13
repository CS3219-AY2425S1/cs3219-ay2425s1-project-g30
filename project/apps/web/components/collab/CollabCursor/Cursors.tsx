import { HocuspocusProvider } from '@hocuspocus/provider';
import { UserDataDto } from '@repo/dtos/users';
import debounce from 'lodash/debounce';
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';

import { hashCode, injectCursorStyle, removeStyles } from '@/utils/cursorStyle';

import CursorWidget from './CursorWidget';

interface CursorsProps {
  provider: HocuspocusProvider;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  user: UserDataDto;
}

export const Cursors = ({ provider, editor, user }: CursorsProps) => {
  const decorationsRef = useRef<string[]>([]);
  const updatingRef = useRef(false);

  useEffect(() => {
    if (!provider || !editor || !user) return;

    const awareness = provider.awareness;
    if (!awareness) return;

    const userColor = `hsl(${hashCode(user.id) % 360}, 70%, 45%)`;

    awareness.setLocalState({
      user: {
        id: user.id,
        color: userColor,
      },
    });

    const debouncedUpdateCursors = debounce(() => {
      if (!editor || updatingRef.current) return;
      updatingRef.current = true;

      try {
        const states = Array.from(awareness.getStates().entries());
        const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

        states.forEach(([clientId, state]) => {
          if (!state?.user || state.user.id === user.id) return;

          const { selection } = state;
          if (!selection) return;

          // Handle selection decoration
          if (
            selection.startLineNumber !== selection.endLineNumber ||
            selection.startColumn !== selection.endColumn
          ) {
            newDecorations.push({
              range: new monaco.Range(
                selection.startLineNumber,
                selection.startColumn,
                selection.endLineNumber,
                selection.endColumn,
              ),
              options: {
                className: `selection-${clientId}`,
                stickiness:
                  monaco.editor.TrackedRangeStickiness
                    .NeverGrowsWhenTypingAtEdges,
              },
            });
          }

          // Add cursor decoration
          newDecorations.push({
            range: new monaco.Range(
              selection.startLineNumber,
              selection.startColumn,
              selection.startLineNumber,
              selection.startColumn,
            ),
            options: {
              className: `cursor-${clientId}`,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          });

          injectCursorStyle(clientId, state.user.color);
        });

        // Update decorations
        decorationsRef.current = editor.deltaDecorations(
          decorationsRef.current,
          newDecorations,
        );
      } finally {
        updatingRef.current = false;
      }
    }, 50);

    // Track local cursor/selection changes
    const disposable = editor.onDidChangeCursorSelection((e) => {
      if (updatingRef.current) return;

      awareness.setLocalState({
        ...awareness.getLocalState(),
        selection: {
          startLineNumber: e.selection.startLineNumber,
          startColumn: e.selection.startColumn,
          endLineNumber: e.selection.endLineNumber,
          endColumn: e.selection.endColumn,
        },
      });
    });

    // Listen for remote cursor updates
    awareness.on('change', debouncedUpdateCursors);

    return () => {
      disposable.dispose();
      awareness.off('change', debouncedUpdateCursors);
      debouncedUpdateCursors.cancel();

      if (editor) {
        editor.deltaDecorations(decorationsRef.current, []);
      }
      removeStyles();
    };
  }, [provider, editor, user]);

  return null;
};
