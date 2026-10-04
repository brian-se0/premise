import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

function commit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/** No runtime networking: the app loads its own files and connects nowhere (ARCHITECTURE.md §10). */
export const CSP = "default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

/** Content Security Policy for built pages only; the dev server needs inline styles and a socket. */
function csp(): Plugin {
  return {
    name: 'premise-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
    ],
  };
}

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react(), csp()],
  define: {
    __COMMIT__: JSON.stringify(commit()),
    __PREVIEW__: JSON.stringify(process.env.PREMISE_PREVIEW === '1'),
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
