// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 250000,
  globalTeardown: './globalTeardown.ts',
  globalSetup: './globalSetup.ts', 
  retries: 0,
  workers: 3,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-report.json' }],
  ],
});
