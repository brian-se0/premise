import { defineConfig, devices } from '@playwright/test';

// Locally, PW_CHROMIUM may point at a preinstalled Chromium; CI installs Chromium and WebKit.
const chromium = process.env.PW_CHROMIUM;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4173/',
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
          command: 'npx tsx scripts/build-content.ts && npx vite build && npx vite preview --port 4173 --strictPort',
          url: 'http://localhost:4173/',
          reuseExistingServer: !process.env.CI,
        },
      }),
});
