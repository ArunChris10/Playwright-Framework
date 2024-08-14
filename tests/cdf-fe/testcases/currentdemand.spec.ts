import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "Currentdemand Page Features (tests for regarding table data)",
  { tag: "@Regression @Currentdemand @ibg-centrifuge-ui" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().currentDemand().navigate();
    });

    test("Summary page shows 'Choose a Demand Output' card upon landing", async () => {
        await test.step('Verify the displayed card has the correct header', async () => {
            await objpageFactory.cdfPageFactory().currentDemand().verifyHasChooseDemandHeader()
        })
    })

    test('A dated demand stack can be chosen within the summary page', async () => {
        await test.step('Verify that the options are dated', async () => {
            await objpageFactory.cdfPageFactory().currentDemand().verifyOptionsHaveDates()
        })

        await test.step('Switch to the first demand scenario', async () => {
            await objpageFactory.cdfPageFactory().currentDemand().switchToFirstDemandStackScenario()
        })
    })

    test(
      "Summary page is statically displayed, can not edit any data in table or redirect to edit summary page",
      { tag: "@editSummaryPage" },
      async () => {
        test.setTimeout(500000);

        await test.step("Check that summary card has published date", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().verifyDemandOutputHasDate()
        })

        await test.step("Check if summary page is staticable", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().checkEditableSummary();
        })
      }
    );
    
  }
);
