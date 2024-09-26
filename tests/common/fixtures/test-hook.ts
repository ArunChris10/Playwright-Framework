import { APIRequest, APIResponse, request, test as base } from "@playwright/test";
import debug from "debug";
import { PageFactory } from "../pages/page-factory";
import { traceRequest } from "./trace-utils";
import { Utility } from "./utils";

export const test = base.extend<{ saveLogs: void; pageFactory: PageFactory , request : APIRequest }>({
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

  request: async({request : APIRequest}, use)=>{

    const apiRequestContext = await request.newContext();
    // Function to wrap traceRequest for a specific HTTP method
    const wrapTraceRequest = (method: string) => {
        return (url: string, options?: APIRequestOptions): Promise<APIResponse> => {
          return traceRequest(method, url, options || {}, apiRequestContext);
        };
      };

          // Overwrite HTTP methods
          apiRequestContext.get = wrapTraceRequest('GET');
          apiRequestContext.post = wrapTraceRequest('POST');
          apiRequestContext.put = wrapTraceRequest('PUT');
          apiRequestContext.delete = wrapTraceRequest('DELETE');
          apiRequestContext.patch = wrapTraceRequest('PATCH');
      
      await use(apiRequestContext);

      // Dispose of the request context
      await apiRequestContext.dispose();
    }

});
export { expect } from "@playwright/test";
