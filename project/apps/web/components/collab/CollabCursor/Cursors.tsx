import { HocuspocusProvider } from '@hocuspocus/provider';
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { UserDataDto } from '@repo/dtos/users';
import debounce from 'lodash/debounce';
import CursorWidget from './CursorWidget';
import { hashCode, injectCursorStyle, removeStyles } from '@/utils/cursorStyle';

interface CursorsProps {
  provider: HocuspocusProvider;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  user: UserDataDto;
}

export const Cursors = ({ provider, editor, user }: CursorsProps) => {
  const decorationsRef = useRef<string[]>([]);
  const widgetsRef = useRef<Map<number, CursorWidget>>(new Map());
  const updatingRef = useRef(false);

  useEffect(() => {
    if (!provider || !editor || !user) return;

    const awareness = provider.awareness;
    if (!awareness) return;

    const userColor = `hsl(${hashCode(user.id) % 360}, 70%, 45%)`;

    awareness.setLocalState({
      user: {
        id: user.id,
        name: user.username || user.id,
        color: userColor,
      },
    });

    // This one is to avoid recursive update of cursors error
    const debouncedUpdateCursors = debounce(() => {
      if (!editor || updatingRef.current) return;
      updatingRef.current = true;

      try {
        const states = Array.from(awareness.getStates().entries());
        const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
        const currentWidgetIds = new Set(widgetsRef.current.keys());

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
                inlineClassName: `selected-text-${clientId}`,
                className: `selected-text-${clientId}`,
                stickiness:
                  monaco.editor.TrackedRangeStickiness
                    .NeverGrowsWhenTypingAtEdges,
              },
            });
          }

          // Handle cursor widget
          let widget = widgetsRef.current.get(clientId);
          if (!widget) {
            widget = new CursorWidget(
              editor,
              state.user.name,
              state.user.color,
              clientId,
            );
            widgetsRef.current.set(clientId, widget);
            editor.addContentWidget(widget);
          }
          currentWidgetIds.delete(clientId);

          widget.updatePosition(
            new monaco.Position(
              selection.startLineNumber,
              selection.startColumn,
            ),
          );

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

        // Remove unused widgets
        currentWidgetIds.forEach((id) => {
          const widget = widgetsRef.current.get(id);
          if (widget) {
            editor.removeContentWidget(widget);
            widgetsRef.current.delete(id);
          }
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

      // Cleanup widgets and decorations
      widgetsRef.current.forEach((widget) => {
        editor.removeContentWidget(widget);
      });
      widgetsRef.current.clear();

      if (editor) {
        editor.deltaDecorations(decorationsRef.current, []);
      }
      removeStyles();
    };
  }, [provider, editor, user]);

  return null;
};
