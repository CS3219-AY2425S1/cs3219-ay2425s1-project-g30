import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import axios from 'axios';
import { env } from '@/env.mjs';
import { Button } from '../ui/button';
import { Play } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES, Runtime } from '@/constants/languages';
import EditorSkeleton, {
  LanguageSelectSkeleton,
  RunButtonSkeleton,
  EditorAreaSkeleton,
  OutputSectionSkeleton,
} from './EditorSkeleton';
import { LoadingSpinner } from '../ui/spinner';

interface CollaborativeEditorProps {
  id: string;
  className?: string;
}

const CollaborativeEditor = ({ id, className }: CollaborativeEditorProps) => {
  const [languages, setLanguages] = useState<Runtime[]>([]);
  const [selectedRuntime, setSelectedRuntime] = useState<Runtime | null>(null);
  const [collabLoading, setCollabLoading] = useState(true);
  const [languageLoading, setLanguageLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [output, setOutput] = useState('');

  const editorRef = useRef<any>(null);
  const ydocRef = useRef(new Y.Doc());

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

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setCollabLoading(true);

    if (typeof window !== 'undefined') {
      const ydoc = ydocRef.current;
      const provider = new HocuspocusProvider({
        url: env.NEXT_PUBLIC_COLLAB_SOCKET_URL,
        name: id,
        document: ydoc,
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

      // Update local runtime state when Yjs runtime changes
      const handleYRuntimeChange = () => {
        const { language, version } = yRuntime.get('runtime') as Runtime;

        if (
          language !== selectedRuntime?.language ||
          version !== selectedRuntime?.version
        ) {
          setSelectedRuntime({ language, version });
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
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setRunLoading(false);
    }
  };

  if (languageLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className={className}>
      <div className="flex flex-col h-[calc(100vh-336px)] border border-1 rounded-md shadow-md">
        <div className="flex flex-row justify-between gap-2 p-4 border-b border-gray-300">
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
        <div className="flex h-full p-6">
          <Editor
            theme="light"
            defaultLanguage={selectedRuntime?.language || 'javascript'}
            loading={
              <div className="flex items-start justify-start w-full h-full">
                <EditorAreaSkeleton />
              </div>
            }
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              readOnly: collabLoading,
              automaticLayout: true,
              quickSuggestions: { other: true, comments: false, strings: true },
            }}
            className="w-full"
          />
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
};

export default CollaborativeEditor;
