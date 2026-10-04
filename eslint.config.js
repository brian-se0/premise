import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const DOMAIN = ['src/domain/**'];
const PASS_TIME_IN = 'The domain is pure: pass time, ids and randomness in (AGENTS.md).';

export default tseslint.config(
  { ignores: ['dist', 'src/generated', 'test-results', 'playwright-report', '.claude'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: DOMAIN,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // The domain is pure: no DOM, storage, network, clock or randomness (AGENTS.md). Only the
    // hashing primitives are available as globals.
    files: DOMAIN,
    languageOptions: { globals: { ...globals.es2024, crypto: 'readonly', TextEncoder: 'readonly' } },
    rules: {
      'no-restricted-globals': [
        'error',
        {
          checkGlobalObject: true,
          globals: [
            'window',
            'document',
            'localStorage',
            'sessionStorage',
            'indexedDB',
            'fetch',
            'XMLHttpRequest',
            'WebSocket',
            'navigator',
            'performance',
            'setTimeout',
            'setInterval',
            'process',
          ].map((name) => ({ name, message: PASS_TIME_IN })),
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: PASS_TIME_IN },
        { object: 'Date', property: 'now', message: PASS_TIME_IN },
        { object: 'crypto', property: 'randomUUID', message: PASS_TIME_IN },
        { object: 'crypto', property: 'getRandomValues', message: PASS_TIME_IN },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: PASS_TIME_IN },
        { selector: "CallExpression[callee.name='Date']", message: PASS_TIME_IN },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['node:*', 'fs', 'path', 'child_process'], message: 'No Node APIs in the domain.' },
            { group: ['react', 'react-*', 'dexie'], message: 'No UI or storage libraries in the domain.' },
            {
              group: ['**/ui', '**/ui/**', '**/storage', '**/storage/**'],
              message: 'The domain imports nothing above it.',
            },
          ],
        },
      ],
    },
  },
);
