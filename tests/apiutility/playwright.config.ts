// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 300000,
  globalTeardown: './globalTeardown.ts',
  globalSetup: './globalSetup.ts',
  retries: 0,

  workers: 5,
  reporter: process.env.CI
    ? [
      ["html", { outputFolder: `playwright-report/${process.env.APP_NAME}` }],
      ["@walmartlabs/testburst-playwright-js-reporter"],
    ]
    : "html",

});
