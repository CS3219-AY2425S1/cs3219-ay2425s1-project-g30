'use client';

import { useState, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
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
import { defaultRuntime, LANGUAGES, Runtime } from '@/constants/languages';
import EditorSkeleton from './EditorSkeleton';
import { LoadingSpinner } from '../ui/spinner';

interface CollaborativeEditorProps {
  id: string;
  className?: string;
}

const CollaborativeEditor = ({ id, className }: CollaborativeEditorProps) => {
  const [languages, setLanguages] = useState<Runtime[]>([]);
  const [selectedRuntime, setSelectedRuntime] =
    useState<Runtime>(defaultRuntime);
  const [languageLoading, setLanguageLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [output, setOutput] = useState('');
  const monaco = useMonaco();

  useEffect(() => {
    const fetchRuntimes = async () => {
      setLanguageLoading(true);
      try {
        const response = await axios.get(
          'https://emkc.org/api/v2/piston/runtimes',
        );

        // Filter languages
        const filteredLanguages = response.data.filter((runtime: Runtime) =>
          Object.values(LANGUAGES).includes(runtime.language as LANGUAGES),
        );
        setLanguages(filteredLanguages);

        // Set the initial runtime
        setSelectedRuntime(filteredLanguages[0] || defaultRuntime);
      } catch (error) {
        console.error('Failed to fetch runtimes:', error);
      } finally {
        setLanguageLoading(false);
      }
    };

    fetchRuntimes();
  }, []);

  // Set up the collaborative Yjs document and bindings
  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: env.NEXT_PUBLIC_COLLAB_SOCKET_URL,
      name: id,
      document: ydoc,
    });

    const yText = ydoc.getText('monaco');
    const editor = monaco?.editor.getEditors()[0];

    if (editor) {
      new MonacoBinding(
        yText,
        editor.getModel()!,
        // @ts-expect-error TODO: fix this
        new Set([editor]),
        provider.awareness,
      );
    }

    const yRuntime = ydoc.getMap('runtime');

    if (!yRuntime.has('language') && selectedRuntime) {
      yRuntime.set('language', selectedRuntime.language);
      yRuntime.set('version', selectedRuntime.version);
    }

    // Observe changes and update selected runtime
    const handleYRuntimeChange = () => {
      const newLanguage = yRuntime.get('language') as LANGUAGES;
      const newVersion = yRuntime.get('version') as string;

      if (
        newLanguage !== selectedRuntime.language ||
        newVersion !== selectedRuntime.version
      ) {
        setSelectedRuntime({ language: newLanguage, version: newVersion });
      }
    };

    yRuntime.observe(handleYRuntimeChange);

    return () => {
      provider.disconnect();
      yRuntime.unobserve(handleYRuntimeChange);
    };
  }, [monaco]);

  // Observe changes and update yRuntime
  useEffect(() => {
    const ydoc = new Y.Doc();
    const yRuntime = ydoc.getMap('runtime');

    if (selectedRuntime) {
      yRuntime.set('language', selectedRuntime.language);
      yRuntime.set('version', selectedRuntime.version);
    }
  }, [selectedRuntime]);

  const runCode = async () => {
    const code = monaco?.editor.getModels()[0]?.getValue();
    if (!selectedRuntime) return;

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
            <Select
              onValueChange={(value) => {
                const newRuntime =
                  languages.find((lang) => lang.language === value) ||
                  defaultRuntime;
                setSelectedRuntime(newRuntime);
              }}
              defaultValue={selectedRuntime?.language}
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
          </div>
          <Button
            onClick={runCode}
            disabled={runLoading}
            variant="ghost"
            className="select-none"
          >
            <Play className="w-4 h-4 mr-2" /> Run Code
          </Button>
        </div>
        {/* Monaco Editor */}
        <div className="flex h-full">
          <Editor
            theme="light"
            defaultLanguage={selectedRuntime?.language || 'javascript'}
            className="w-full h-full py-6"
          />
        </div>
      </div>

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
    </div>
  );
};

export default CollaborativeEditor;
