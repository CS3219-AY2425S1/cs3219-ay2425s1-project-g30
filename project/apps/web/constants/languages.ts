export enum LANGUAGES {
  JavaScript = 'javascript',
  Python = 'python',
  Java = 'java',
  C = 'c',
  Cpp = 'cpp',
  Go = 'go',
  Ruby = 'ruby',
  PHP = 'php',
  Rust = 'rust',
}

export interface Runtime {
  language: LANGUAGES;
  version: string;
}