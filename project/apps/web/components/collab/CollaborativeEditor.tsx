import { HocuspocusProvider } from '@hocuspocus/provider';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  collabUpdateLanguageDto,
  ExecutionSnapshotCreateDto,
} from '@repo/dtos/collab';
import axios from 'axios';
import { Play } from 'lucide-react';
import * as monaco from 'monaco-editor';
import { useRouter } from 'next/navigation';
import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES, Runtime } from '@/constants/languages';
import { env } from '@/env.mjs';
import { useToast } from '@/hooks/use-toast';
import { saveExecutionSnapshot, updateCollabLanguage } from '@/lib/api/collab';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollabStore } from '@/stores/useCollabStore';

import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/spinner';

import EditorSkeleton, {
  LanguageSelectSkeleton,
  RunButtonSkeleton,
  EditorAreaSkeleton,
  OutputSectionSkeleton,
} from './EditorSkeleton';
import Timer, { TimerState } from './Timer';
import './CollabCursor/Cursors.css';
import { Cursors } from './CollabCursor/Cursors';

interface CollaborativeEditorProps {
  id: string;
  className?: string;
}

export interface CollaborativeEditorRef {
  endSession: () => void;
}

const CollaborativeEditor = forwardRef<
  CollaborativeEditorRef,
  CollaborativeEditorProps
>(({ id, className }, ref) => {
  const user = useAuthStore.use.user();
  const setCollaboration = useCollabStore.use.setCollaboration();
  const [languages, setLanguages] = useState<Runtime[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<Runtime | null>(null);
  const [collabLoading, setCollabLoading] = useState(true);
  const [languageLoading, setLanguageLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
    lastStartTime: null,
  });
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const ydocRef = useRef(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    endSession,
  }));

  // Fetch available languages on mount
  useEffect(() => {
    const fetchRuntimes = async () => {
      setLanguageLoading(true);
      try {
        const response = await axios.get(
          'https://emkc.org/api/v2/piston/runtimes',
        );

        // Filter and deduplicate available languages
        const filteredLanguages = response.data.filter((runtime: Runtime) =>
          Object.values(LANGUAGES).includes(runtime.language as LANGUAGES),
        );

        const uniqueLanguages = Array.from(
          new Map(
            filteredLanguages.map((runtime: Runtime) => [
              runtime.language,
              runtime,
            ]),
          ).values(),
        ) as Runtime[];

        setLanguages(uniqueLanguages);
        setSelectedRuntime(filteredLanguages[0]);
      } catch (error) {
        console.error('Failed to fetch runtimes:', error);
      } finally {
        setLanguageLoading(false);
      }
    };

    fetchRuntimes();
  }, []);

  // Initialize Yjs timer state
  useEffect(() => {
    const yTimer = ydocRef.current.getMap('timer');

    // Initialize timer state if not present
    if (!yTimer.has('isRunning')) {
      yTimer.set('isRunning', false);
      yTimer.set('elapsedTime', 0);
      yTimer.set('lastStartTime', null);
    }

    // Observe changes to the timer state
    const updateTimer = () => {
      const isRunning = yTimer.get('isRunning') as boolean;
      const elapsedTime = yTimer.get('elapsedTime') as number;
      const lastStartTime = yTimer.get('lastStartTime') as number | null;

      let newElapsedTime = elapsedTime;

      if (isRunning && lastStartTime) {
        const currentTime = Date.now();
        newElapsedTime += Math.floor((currentTime - lastStartTime) / 1000);
      }

      setTimerState({
        isRunning,
        elapsedTime: newElapsedTime,
        lastStartTime,
      });
    };

    yTimer.observeDeep(updateTimer);

    // Initial timer update
    updateTimer();

    // Cleanup
    return () => {
      yTimer.unobserveDeep(updateTimer);
    };
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor as monaco.editor.IStandaloneCodeEditor;
    setCollabLoading(true);

    if (typeof window !== 'undefined') {
      const ydoc = ydocRef.current;
      const provider = new HocuspocusProvider({
        url: env.NEXT_PUBLIC_COLLAB_SOCKET_URL,
        name: id,
        document: ydoc,
      });
      providerRef.current = provider;

      provider.awareness?.on('change', () => {
        if (provider.awareness?.getStates().values()) {
          const states = Array.from(provider.awareness?.getStates().values());
          const sessionEnded = states.find(
            (state) => state.sessionEnded,
          )?.sessionEnded;

          if (sessionEnded && sessionEnded.endedBy !== user?.id) {
            toast({
              variant: 'error',
              title: 'Session Ended',
              description: 'Your collaborator ended the session.',
            });
            setCollaboration(null);
            provider.disconnect();
            router.push('/');
          }
        }
      });

      // Mark loading as false once synced
      provider.on('synced', () => {
        setTimeout(() => setCollabLoading(false), 100);
      });

      // Bind Monaco editor to Yjs document
      const yText = ydoc.getText('monaco');
      new MonacoBinding(
        yText,
        editor.getModel()!,
        new Set([editor]),
        provider.awareness,
      );

      // Initialize runtime state in Yjs map if not present
      const yRuntime = ydoc.getMap('runtime');
      if (!yRuntime.has('runtime') && selectedRuntime) {
        yRuntime.set('runtime', {
          language: selectedRuntime.language,
          version: selectedRuntime.version,
        });
      }

      // Update local runtime state and editor language when Yjs runtime changes
      const handleYRuntimeChange = () => {
        const { language, version } = yRuntime.get('runtime') as Runtime;

        if (
          language !== selectedRuntime?.language ||
          version !== selectedRuntime?.version
        ) {
          setSelectedRuntime({ language, version });

          updateCollabLanguage({
            collab_id: id,
            language,
          } satisfies collabUpdateLanguageDto);

          if (editorRef.current && language) {
            const currentModel = editorRef.current.getModel();
            monaco.editor.setModelLanguage(currentModel!, language);
          }
        }
      };

      yRuntime.observe(handleYRuntimeChange);

      return () => {
        provider.disconnect();
        yRuntime.unobserve(handleYRuntimeChange);
      };
    } else {
      setCollabLoading(false);
    }
  };

  const endSession = () => {
    if (providerRef.current) {
      providerRef.current.setAwarenessField('sessionEnded', {
        endedBy: user?.id,
      });
    }
  };

  const runCode = async () => {
    const code = editorRef.current?.getModel()?.getValue();
    if (!selectedRuntime || !code) return;

    setRunLoading(true);

    try {
      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        {
          language: selectedRuntime.language,
          version: selectedRuntime.version,
          files: [
            {
              name: 'main',
              content: code,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      const output =
        response.data?.run?.output ||
        response.data?.run?.stderr ||
        'Error: Empty code input.';
      setOutput(output);

      // save code execution snapshot in its own try-catch block
      await saveCodeExecutionSnapshot(code, selectedRuntime.language, output);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setRunLoading(false);
    }
  };

  const saveCodeExecutionSnapshot = async (
    code: string,
    language: string,
    output: string,
  ) => {
    try {
      // save code execution snapshot
      const snapshot: ExecutionSnapshotCreateDto = {
        collaboration_id: id,
        code,
        output,
        language,
        user_id: user!.id,
      };
      await saveExecutionSnapshot(snapshot);
    } catch (error) {
      console.error('Failed to save code execution snapshot:', error);
    }
  };

  if (languageLoading) {
    return <EditorSkeleton />;
  }

  // Timer Controls
  const startTimer = () => {
    const yTimer = ydocRef.current.getMap('timer');
    ydocRef.current.transact(() => {
      yTimer.set('isRunning', true);
      yTimer.set('lastStartTime', Date.now());
    });
  };

  const pauseTimer = () => {
    const yTimer = ydocRef.current.getMap('timer');
    ydocRef.current.transact(() => {
      yTimer.set('isRunning', false);
      const lastStartTime = yTimer.get('lastStartTime') as number | null;
      if (lastStartTime) {
        const currentTime = Date.now();
        const additionalTime = Math.floor((currentTime - lastStartTime) / 1000);
        yTimer.set(
          'elapsedTime',
          (yTimer.get('elapsedTime') as number) + additionalTime,
        );
        yTimer.set('lastStartTime', null);
      }
    });
  };

  const resetTimer = () => {
    const yTimer = ydocRef.current.getMap('timer');
    ydocRef.current.transact(() => {
      yTimer.set('isRunning', false);
      yTimer.set('elapsedTime', 0);
      yTimer.set('lastStartTime', null);
    });
  };

  return (
    <div className={className}>
      <div className="flex flex-col h-[calc(100vh-336px)] border border-1 rounded-md shadow-md">
        <div className="flex flex-row justify-between gap-2 p-4 border-b border-gray-300">
          <Timer
            timerState={timerState}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            resetTimer={resetTimer}
          />
          <div className="flex items-center gap-2">
            {collabLoading ? (
              <LanguageSelectSkeleton />
            ) : (
              <Select
                onValueChange={(value) => {
                  const newRuntime = languages.find(
                    (lang) => lang.language === value,
                  );
                  const yRuntime = ydocRef.current.getMap('runtime');

                  yRuntime.set('runtime', {
                    language: newRuntime?.language,
                    version: newRuntime?.version,
                  });
                }}
                value={selectedRuntime?.language}
              >
                <SelectTrigger className="w-48 outline-none">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    new Set(languages.map((lang) => lang.language)),
                  ).map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {collabLoading ? (
            <RunButtonSkeleton />
          ) : (
            <Button
              onClick={runCode}
              disabled={runLoading}
              variant="ghost"
              className="select-none"
            >
              <Play className="w-4 h-4 mr-2" /> Run Code
            </Button>
          )}
        </div>
        {/* Monaco Editor */}
        <div className="flex h-full p-6 relative">
          <Editor
            theme="light"
            defaultLanguage={selectedRuntime?.language || 'javascript'}
            loading={
              <div className="flex items-start justify-start w-full h-full">
                <EditorAreaSkeleton />
              </div>
            }
            onMount={(editor, monaco) => handleEditorDidMount(editor, monaco)}
            options={{
              minimap: { enabled: false },
              readOnly: collabLoading,
              automaticLayout: true,
              quickSuggestions: { other: true, comments: false, strings: true },
              glyphMargin: true,
            }}
            className="w-full"
          />
          {!collabLoading && (
            <Cursors
              provider={providerRef.current!}
              editor={editorRef.current}
              user={user!}
            />
          )}
        </div>
      </div>

      {collabLoading ? (
        <OutputSectionSkeleton />
      ) : (
        <div className="flex flex-col mt-8 h-[184px] border border-1 rounded-md shadow-md">
          <div className="px-6 py-4 font-semibold border-b border-gray-300">
            Output
          </div>
          {runLoading ? (
            <div className="flex items-center justify-center flex-grow w-full">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="h-full px-6 py-4 overflow-auto whitespace-pre-wrap">
              {output}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default CollaborativeEditor;
