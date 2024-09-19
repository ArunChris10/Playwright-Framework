import { test as base } from "@playwright/test";
import debug from "debug";
import { PageFactory } from "../pages/page-factory";
import { Utility } from "./utils";

export const test = base.extend<{ saveLogs: void; pageFactory: PageFactory }>({
  saveLogs: [
    async ({}, use, testInfo) => {
      // Collecting logs during the test.
      const logs: String[] = [];
      debug.log = (...args) =>
        logs.push(args.map((arg) => String(arg)).join(""));
      debug.enable("myserver");

      await use();

      await Utility.addLogs(testInfo, logs);
    },
    { auto: true },
  ],

  /**
   * Creates a new instance of the PageFactory class using the provided browser and page.
   *
   * @param {Object} options - The options object.
   * @param {Browser} options.browser - The browser instance.
   * @param {Function} use - The callback function to use the created PageFactory.
   * @return {Promise<void>} A promise that resolves when the PageFactory is created.
   */
  pageFactory: async ({ browser }, use) => {
    await use(new PageFactory(await browser.newPage()));
  },
});
export { expect } from "@playwright/test";
