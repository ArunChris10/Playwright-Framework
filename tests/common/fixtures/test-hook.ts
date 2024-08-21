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

  pageFactory: async ({ browser }, use) => {
    await use(new PageFactory(await browser.newPage()));
  },
});
export { expect } from "@playwright/test";
