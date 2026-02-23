import type * as Monaco from 'monaco-editor';

export function registerClarityLanguage(monaco: typeof Monaco) {
  // Register language
  monaco.languages.register({ id: 'clarity', extensions: ['.clar'], aliases: ['Clarity', 'clarity'] });

  // Set language configuration
  monaco.languages.setLanguageConfiguration('clarity', {
    comments: {
      lineComment: ';;',
    },
    brackets: [['(', ')']],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });

  // Set tokenizer (syntax highlighting)
  monaco.languages.setMonarchTokensProvider('clarity', {
    keywords: [
      'define-public', 'define-read-only', 'define-private',
      'define-data-var', 'define-map', 'define-constant',
      'define-fungible-token', 'define-non-fungible-token',
      'define-trait', 'impl-trait', 'use-trait',
    ],
    controlFlow: [
      'if', 'begin', 'let', 'match', 'and', 'or', 'not',
    ],
    builtins: [
      'ok', 'err', 'some', 'none', 'is-ok', 'is-err', 'is-some', 'is-none',
      'default-to', 'unwrap!', 'unwrap-err!', 'try!', 'asserts!',
      'var-get', 'var-set',
      'map-get?', 'map-set', 'map-insert', 'map-delete',
      'get', 'merge', 'tuple',
      'list', 'filter', 'map', 'fold', 'append', 'len', 'concat', 'as-max-len?',
      'ft-mint?', 'ft-transfer?', 'ft-get-balance', 'ft-get-supply',
      'nft-mint?', 'nft-transfer?', 'nft-get-owner?', 'nft-burn?',
      'stx-transfer?', 'stx-burn?', 'stx-get-balance',
      'contract-call?', 'as-contract', 'contract-of',
      'print', 'log2', 'sqrti', 'pow', 'mod',
      'to-int', 'to-uint',
      'is-standard', 'is-in-mainnet', 'is-in-regtest',
      'tx-sender', 'contract-caller', 'block-height', 'burn-block-height',
      'stx-liquid-supply',
    ],
    typeKeywords: [
      'uint', 'int', 'bool', 'principal', 'buff', 'string-ascii', 'string-utf8',
      'list', 'optional', 'response', 'tuple',
      'true', 'false',
    ],
    tokenizer: {
      root: [
        // Comments
        [/;;.*$/, 'comment'],
        // Strings
        [/"[^"]*"/, 'string'],
        // uint literals (u0, u1, u100, etc.)
        [/\bu\d+\b/, 'number.uint'],
        // Negative integers
        [/-\d+/, 'number'],
        // Positive integers
        [/\b\d+\b/, 'number'],
        // Keywords (define-*, impl-trait, etc.)
        [/\b(define-public|define-read-only|define-private|define-data-var|define-map|define-constant|define-fungible-token|define-non-fungible-token|define-trait|impl-trait|use-trait)\b/, 'keyword'],
        // Control flow
        [/\b(if|begin|let|match|and|or|not)\b/, 'keyword.control'],
        // Built-in functions
        [/\b(ok|err|some|none|is-ok|is-err|is-some|is-none|default-to|unwrap!|unwrap-err!|try!|asserts!|var-get|var-set|map-get\?|map-set|map-insert|map-delete|get|merge|list|filter|map|fold|append|len|concat|as-max-len\?|ft-mint\?|ft-transfer\?|ft-get-balance|nft-mint\?|nft-transfer\?|nft-get-owner\?|stx-transfer\?|stx-get-balance|contract-call\?|as-contract|tx-sender|contract-caller|block-height|print|to-int|to-uint)\b/, 'support.function'],
        // Type keywords
        [/\b(uint|int|bool|principal|buff|string-ascii|string-utf8|optional|response|tuple|true|false)\b/, 'type'],
        // Brackets
        [/[()]/, 'delimiter'],
        // Identifiers
        [/[a-zA-Z_][a-zA-Z0-9_\-!?]*/, 'identifier'],
      ],
    },
  });

  // Define theme colors for clarity tokens
  monaco.editor.defineTheme('clarity-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7c9ef7', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'c678dd' },
      { token: 'support.function', foreground: 'e5c07b' },
      { token: 'type', foreground: '56b6c2' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'number.uint', foreground: 'd19a66' },
      { token: 'string', foreground: '98c379' },
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'identifier', foreground: 'abb2bf' },
    ],
    colors: {
      'editor.background': '#1e1e2e',
    },
  });

  // Define light theme for clarity
  monaco.editor.defineTheme('clarity-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '4078f2', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'a626a4' },
      { token: 'support.function', foreground: 'c18401' },
      { token: 'type', foreground: '0184bc' },
      { token: 'number', foreground: '986801' },
      { token: 'number.uint', foreground: '986801' },
      { token: 'string', foreground: '50a14f' },
      { token: 'comment', foreground: 'a0a1a7', fontStyle: 'italic' },
      { token: 'identifier', foreground: '383a42' },
    ],
    colors: {
      'editor.background': '#fafafa',
    },
  });
}

export const CLARITY_DEFAULT_CODE = `;; Counter Contract - Clarity Studio Starter
(define-data-var counter uint u0)

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

(define-public (decrement)
  (begin
    (var-set counter (- (var-get counter) u1))
    (ok (var-get counter))))

(define-read-only (get-counter)
  (ok (var-get counter)))
`;
