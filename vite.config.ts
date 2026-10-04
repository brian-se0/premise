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

/** Content Security Policy for built pages only; the dev server needs inline styles and a socket. */
function csp(): Plugin {
  return {
    name: 'premise-csp',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="default-src 'self'" />`,
      ),
  };
}

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react(), csp()],
  define: {
    __COMMIT__: JSON.stringify(commit()),
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
