// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  retries: 0,
  workers:3,
  use: {
    baseURL: 'https://your-default-base-url.com',
  },
  reporter: [
    ['list'],               // console reporter
    ['html', { open: 'never' }],  // generates HTML report
    ['json', { outputFile: 'test-report.json' }], // optional
  ],
});
