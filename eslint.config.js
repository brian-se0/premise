import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/generated', 'test-results', 'playwright-report'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    // The domain is pure: no DOM, storage, network or clock (AGENTS.md).
    files: ['src/domain/**'],
    languageOptions: { globals: { crypto: 'readonly', TextEncoder: 'readonly' } },
    rules: {
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'indexedDB', 'fetch', 'navigator'],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: 'Pass time in.' },
        { selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']", message: 'Pass time in.' },
      ],
      'no-restricted-imports': ['error', { patterns: ['react', 'react-*', 'dexie', '../ui/*', '../storage/*'] }],
    },
  },
);
