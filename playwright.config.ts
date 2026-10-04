import { defineConfig, devices } from '@playwright/test';

// E2E_BASE_URL: test an already deployed site. Otherwise the tests build (unless E2E_PREBUILT is
// set) and serve the site locally under PAGES_BASE, the same base path the deployment uses.
// Locally, PW_CHROMIUM may point at a preinstalled Chromium; CI installs Chromium and WebKit.
const chromium = process.env.PW_CHROMIUM;
const base = process.env.PAGES_BASE ?? '/';
const local = `http://localhost:4173${base}`;
const build = process.env.E2E_PREBUILT ? '' : 'npm run build && ';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? local,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 7'], ...(chromium ? { launchOptions: { executablePath: chromium } } : {}) },
    },
    ...(process.env.E2E_WEBKIT === '0' ? [] : [{ name: 'webkit', use: { ...devices['iPhone 15'] } }]),
  ],
  ...(process.env.E2E_BASE_URL
    ? {}
    : {
        webServer: {
          command: `${build}npx vite preview --port 4173 --strictPort`,
          url: local,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
