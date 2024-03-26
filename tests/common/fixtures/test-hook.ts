import debug from 'debug';
import { test as base } from '@playwright/test';
import { Utility } from './utils';

export const test = base.extend<{ saveLogs: void }>({
  saveLogs: [async ({ }, use, testInfo) => {
    // Collecting logs during the test.
    const logs: String[] = [];
    debug.log = (...args) => logs.push(args.map(arg => String(arg)).join(''));
    debug.enable('myserver');

    await use();

    await Utility.addLogs(testInfo, logs)
  }, { auto: true }],
  
});

export { expect } from '@playwright/test';