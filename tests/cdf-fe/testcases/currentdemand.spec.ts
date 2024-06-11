import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "CurrentDemand Page Features",
  { tag: "@Smoke @Currentdemand" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().currentDemand().navigate();
    });

    test(
      "Summary page is statically displayed",
      { tag: "@editSummaryPage" },
      async () => {
        test.setTimeout(500000);

        await test.step("Check if summary page is staticable", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().checkEditableSummary();
        })
      }
    );
    
  }
);
