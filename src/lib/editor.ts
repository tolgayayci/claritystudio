import * as monaco from 'monaco-editor';
import { registerClarityLanguage } from './clarityLanguage';

// TOML language definition for Monaco
const tomlLanguageDefinition: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Comments
      [/#.*$/, 'comment'],

      // Section headers [section] or [section.subsection]
      [/\[[^\]]*\]/, 'keyword'],

      // Keys (before =)
      [/^[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=)/, 'variable'],
      [/[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=)/, 'variable'],

      // Strings
      [/"""/, 'string', '@multiLineString'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string'],
      [/'[^']*'/, 'string'],

      // Numbers
      [/\b\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/, 'number'], // dates
      [/[+-]?\d+\.\d+([eE][+-]?\d+)?/, 'number.float'],
      [/0x[0-9a-fA-F]+/, 'number.hex'],
      [/0o[0-7]+/, 'number.octal'],
      [/0b[01]+/, 'number.binary'],
      [/[+-]?\d+/, 'number'],

      // Booleans
      [/\b(true|false)\b/, 'keyword.constant'],

      // Operators
      [/=/, 'operator'],

      // Brackets
      [/[{}\[\]]/, 'delimiter.bracket'],
      [/[,]/, 'delimiter'],
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop'],
    ],
    multiLineString: [
      [/[^"]+/, 'string'],
      [/"""/, 'string', '@pop'],
      [/"/, 'string'],
    ],
  },
};

// TOML language configuration
const tomlLanguageConfig: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '#',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

// Shell/Bash language definition
const shellLanguageDefinition: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      // Comments
      [/#.*$/, 'comment'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@doubleString'],
      [/'[^']*'/, 'string'],

      // Keywords
      [/\b(if|then|else|elif|fi|case|esac|for|while|do|done|in|function|return|exit|break|continue|export|local|readonly|declare|typeset|unset|shift|source)\b/, 'keyword'],

      // Built-in commands
      [/\b(echo|cd|pwd|ls|cat|grep|sed|awk|find|xargs|sort|uniq|wc|head|tail|cut|tr|mkdir|rm|cp|mv|chmod|chown|touch|test)\b/, 'keyword.other'],

      // Variables
      [/\$\{[^}]+\}/, 'variable'],
      [/\$[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
      [/\$[0-9@#?$!-]/, 'variable'],

      // Numbers
      [/\b\d+\b/, 'number'],

      // Operators
      [/[|&;><]/, 'operator'],
      [/[=!<>]=?/, 'operator'],
    ],
    doubleString: [
      [/[^\\"$]+/, 'string'],
      [/\\./, 'string.escape'],
      [/\$\{[^}]+\}/, 'variable'],
      [/\$[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
      [/"/, 'string', '@pop'],
    ],
  },
};

// Language configuration for Rust
export const rustLanguageConfig: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: '\'', close: '\'' },
  ],
  indentationRules: {
    increaseIndentPattern: /^.*\{[^}"']*$|^.*\([^)"']*$|^\s*(pub\s+)?((if|while|for|match|impl|struct|enum|mod|unsafe)\b.*?)?\s*$/,
    decreaseIndentPattern: /^(.*\*\/)?\s*[})].*$/,
  },
};

// Initialize Monaco editor with Rust, TOML, and other language support
export function initializeMonaco(monaco: typeof import('monaco-editor')) {
  // First, configure themes
  configureThemes(monaco);

  // Register TOML language
  if (!monaco.languages.getLanguages().some(lang => lang.id === 'toml')) {
    monaco.languages.register({ id: 'toml', extensions: ['.toml'], aliases: ['TOML', 'toml'] });
    monaco.languages.setLanguageConfiguration('toml', tomlLanguageConfig);
    monaco.languages.setMonarchTokensProvider('toml', tomlLanguageDefinition);
  }

  // Register Shell/Bash language
  if (!monaco.languages.getLanguages().some(lang => lang.id === 'shell')) {
    monaco.languages.register({ id: 'shell', extensions: ['.sh', '.bash'], aliases: ['Shell', 'Bash', 'sh', 'bash'] });
    monaco.languages.setMonarchTokensProvider('shell', shellLanguageDefinition);
  }

  // Register Clarity language if not already registered
  if (!monaco.languages.getLanguages().some(lang => lang.id === 'clarity')) {
    registerClarityLanguage(monaco);

    // Create Clarity completion items after Monaco is initialized
    const createCompletionItems = () => {
      // Clarity built-in snippets
      const CLARITY_SNIPPETS = [
        {
          label: 'define-public',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Public function definition',
          documentation: 'Define a public function callable by anyone',
          insertText: [
            '(define-public (${1:function-name} (${2:param} ${3:type}))',
            '  (begin',
            '    ${4:;; implementation}',
            '    (ok ${5:result})))',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-read-only',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Read-only function definition',
          documentation: 'Define a read-only function (no state changes)',
          insertText: [
            '(define-read-only (${1:function-name})',
            '  (ok ${2:result}))',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-private',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Private function definition',
          documentation: 'Define a private helper function',
          insertText: [
            '(define-private (${1:function-name} (${2:param} ${3:type}))',
            '  ${4:body})',
          ].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-data-var',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Data variable definition',
          documentation: 'Define a data variable for contract state',
          insertText: '(define-data-var ${1:name} ${2:type} ${3:initial-value})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-map',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Map definition',
          documentation: 'Define a map (key-value store)',
          insertText: '(define-map ${1:name} ${2:key-type} ${3:value-type})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-constant',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Constant definition',
          documentation: 'Define a constant value',
          insertText: '(define-constant ${1:NAME} ${2:value})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-fungible-token',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Fungible token definition',
          documentation: 'Define a SIP-010 fungible token',
          insertText: '(define-fungible-token ${1:token-name})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
        {
          label: 'define-non-fungible-token',
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: 'Non-fungible token definition',
          documentation: 'Define a SIP-009 non-fungible token',
          insertText: '(define-non-fungible-token ${1:token-name} ${2:asset-id-type})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
      ];

      // Clarity built-in function completions
      const CLARITY_BUILTINS = [
        { label: 'tx-sender', detail: 'principal', documentation: 'The principal that initiated the current transaction' },
        { label: 'contract-caller', detail: 'principal', documentation: 'The principal that called this contract' },
        { label: 'block-height', detail: 'uint', documentation: 'The current Stacks block height' },
        { label: 'stx-liquid-supply', detail: 'uint', documentation: 'Total liquid STX supply' },
        { label: 'var-get', detail: 'Read data var', documentation: 'Get the value of a data variable' },
        { label: 'var-set', detail: 'Write data var', documentation: 'Set the value of a data variable' },
        { label: 'map-get?', detail: 'Read map', documentation: 'Get a value from a map (returns optional)' },
        { label: 'map-set', detail: 'Write map', documentation: 'Set a key-value pair in a map' },
        { label: 'stx-transfer?', detail: 'STX transfer', documentation: 'Transfer STX tokens between principals' },
        { label: 'stx-get-balance', detail: 'STX balance', documentation: 'Get the STX balance of a principal' },
        { label: 'ft-mint?', detail: 'Mint FT', documentation: 'Mint fungible tokens' },
        { label: 'ft-transfer?', detail: 'Transfer FT', documentation: 'Transfer fungible tokens' },
        { label: 'nft-mint?', detail: 'Mint NFT', documentation: 'Mint a non-fungible token' },
        { label: 'nft-transfer?', detail: 'Transfer NFT', documentation: 'Transfer a non-fungible token' },
        { label: 'contract-call?', detail: 'Cross-contract', documentation: 'Call a function on another contract' },
        { label: 'as-contract', detail: 'Context switch', documentation: 'Execute expression as the contract principal' },
        { label: 'unwrap!', detail: 'Error handling', documentation: 'Unwrap an optional/response or return error' },
        { label: 'try!', detail: 'Error handling', documentation: 'Short-circuit on err/none response' },
        { label: 'asserts!', detail: 'Assertion', documentation: 'Assert a condition or return error' },
      ].map(item => ({
        ...item,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: item.label,
      }));

      // Register completion provider
      monaco.languages.registerCompletionItemProvider('clarity', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = [...CLARITY_SNIPPETS, ...CLARITY_BUILTINS];

          return {
            suggestions: suggestions.map(item => ({
              ...item,
              range,
            })),
          };
        },
      });

      // Add hover provider for documentation
      monaco.languages.registerHoverProvider('clarity', {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (!word) return null;

          const item = [...CLARITY_SNIPPETS, ...CLARITY_BUILTINS]
            .find(i => i.label === word.word);

          if (item && item.documentation) {
            return {
              contents: [
                { value: `**${item.label}**` },
                { value: item.documentation as string },
              ],
            };
          }

          return null;
        },
      });
    };

    // Create completions after Monaco is ready
    setTimeout(createCompletionItems, 100);
  }
}

// Define editor theme based on dark/light mode
export function defineEditorTheme(monaco: typeof import('monaco-editor'), isDark: boolean) {
  // Ensure themes are configured
  configureThemes(monaco);
  const themeName = isDark ? 'clarity-dark' : 'clarity-light';
  monaco.editor.setTheme(themeName);
}

// Default editor options
export const defaultEditorOptions = {
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on' as const,
  wrappingIndent: 'indent' as const,
  formatOnType: true,
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on' as const,
  folding: true,
  foldingStrategy: 'indentation' as const,
  showFoldingControls: 'always' as const,
  matchBrackets: 'always' as const,
  renderWhitespace: 'selection' as const,
  renderLineHighlight: 'all' as const,
  scrollbar: {
    vertical: 'visible' as const,
    horizontal: 'visible' as const,
    useShadows: true,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
};

// Export editor options
export const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: 'clarity-dark',
  language: 'clarity',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  wrappingIndent: 'indent',
  formatOnType: true,
  formatOnPaste: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'always',
  matchBrackets: 'always',
  renderWhitespace: 'selection',
  renderLineHighlight: 'all',
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    useShadows: true,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
};

// Configure themes
export function configureThemes(monaco: typeof import('monaco-editor')) {
  // Define custom dark theme optimized for Clarity
  monaco.editor.defineTheme('clarity-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7c9ef7', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'c678dd' },
      { token: 'keyword.other', foreground: 'c678dd' },
      { token: 'support.function', foreground: 'e5c07b' },
      { token: 'type', foreground: '56b6c2' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'number.uint', foreground: 'd19a66' },
      { token: 'string', foreground: '98c379' },
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'identifier', foreground: 'abb2bf' },
      { token: 'delimiter', foreground: 'abb2bf' },
    ],
    colors: {
      'editor.background': '#0d0d0d',
      'editor.foreground': '#abb2bf',
      'editor.lineHighlightBackground': '#1a1a1a',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#264f7855',
      'editorLineNumber.foreground': '#4a4a4a',
      'editorLineNumber.activeForeground': '#abb2bf',
      'editorCursor.foreground': '#528bff',
      'editorWhitespace.foreground': '#2a2a2a',
    },
  });

  // Define custom light theme optimized for Clarity
  monaco.editor.defineTheme('clarity-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '4078f2', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'a626a4' },
      { token: 'keyword.other', foreground: 'a626a4' },
      { token: 'support.function', foreground: 'c18401' },
      { token: 'type', foreground: '0184bc' },
      { token: 'number', foreground: '986801' },
      { token: 'number.uint', foreground: '986801' },
      { token: 'string', foreground: '50a14f' },
      { token: 'comment', foreground: 'a0a1a7', fontStyle: 'italic' },
      { token: 'identifier', foreground: '383a42' },
      { token: 'delimiter', foreground: '383a42' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#383a42',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editor.selectionBackground': '#d2d9e5',
      'editor.inactiveSelectionBackground': '#d2d9e555',
      'editorLineNumber.foreground': '#9d9d9f',
      'editorLineNumber.activeForeground': '#383a42',
      'editorCursor.foreground': '#526fff',
      'editorWhitespace.foreground': '#e0e0e0',
    },
  });
}