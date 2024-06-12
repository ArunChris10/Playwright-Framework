import { test } from "../../common/fixtures/test-hook";
import testdata from "../testdata/create-publishDSS.json";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "Publish Demand Stack Scenario Tests (Make sure DSS can be published and viewed on currentdemand page)",
  { tag: "@Smoke @PublishDSS" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });

    test(
      "Publish DSS works (User can select which slot to publish too and corresponding slot will be published on currentdemand page)",
      { tag: "@publishDSS" },
      async () => {
        test.setTimeout(500000);

        await test.step("Go to the first DSS", async () => {
            await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
        });

        await test.step("Open publish DSS modal", async () => {
            await objpageFactory.cdfPageFactory().dssPage().openPublishDSSModal();
        });

        await test.step("Populate DSS modal with test data", async () => {
            await objpageFactory.cdfPageFactory().dssPage().populatePublishDSSModal(testdata.options, testdata.slot);
        });

        await test.step("Wait for publish", async () => {
            await objpageFactory.cdfPageFactory().dssPage().waitForPublishDSS();
        });

        await test.step("Navigate to current demand page", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().navigate();
        });

        await test.step("Verify DSS has been published", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().verifyDSSPublished(testdata.dssName);
        })

      }
    );
    
  }
);
