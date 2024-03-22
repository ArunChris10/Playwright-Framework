import { defineConfig, devices } from '@playwright/test';
import nexusTokens from './secrets/nexus-users-token.json'
import ibgTokens from './secrets/ibg-users-token.json'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ?[['html'],['@walmartlabs/testburst-playwright-js-reporter'] ]:"html",
  //reporter: "html",
  //reporter: 'allure-playwright',
  /* maximum time each test can run for */
  timeout: 3 * 60 * 1000,
  expect: {
    /**
    * Maximum time expect() should wait for the condition to be met.
    * For example in 'await expect(locator). toHaveText();*
    */
    timeout: 1 * 30 * 1000
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    /* Timeouts */
    navigationTimeout: 2*60*1000
  },



  /* Configure projects for major browsers */
  projects: [
    {
      name: 'api-setup',
      testMatch: /api-auth-setup\.ts/,
      grep: [new RegExp(process.env.APP_NAME + "")]
    },
    {
      name: 'ui-setup',
      testMatch: /ui-auth-setup\.ts/,
      grep: [new RegExp(process.env.APP_NAME + "")]
    },
    {
      name: 'ufm-be',
      dependencies: ['api-setup'],
      testMatch: /ufm-be.*.spec.ts/,
      grep: [new RegExp(process.env.tag + "")],
      use: {
        extraHTTPHeaders: {
          "Authorization": `Bearer ${nexusTokens[process.env.ufmUser+""]}`
        }
      }
    },
    {
      name: 'ufm-fe',
      dependencies: ['ui-setup'],
      testMatch: /ufm-fe.*.spec.ts/,
      grep: [new RegExp(process.env.tag + "")],
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        storageState: 'secrets/nexus-user-storagestate.json',
        launchOptions: {
          args: ['--ignore-certificate-errors',
          "--start-fullscreen"]
        },        
      }
    },
    {
      name: 'cdf-be',
      dependencies: ['api-setup'],
      testMatch: /cdf-be.*.spec.ts/,
      grep: [new RegExp(process.env.tag + "")],
      use: {
        extraHTTPHeaders: {
          "Authorization": `Bearer ${ibgTokens[process.env.cdfUser+""]}`
        }
      }
    },
    {
      name: 'cdf-fe',
      dependencies: ['ui-setup'],
      testMatch: /cdf-fe.*.spec.ts/,
      grep: [new RegExp(process.env.tag + "")],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'secrets/ibg-user-storagestate.json',
        launchOptions: {
          args: ['--ignore-certificate-errors',
          "--start-fullscreen"]
        },                
      }
    }

  ],


});