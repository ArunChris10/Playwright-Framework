import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";
import testdata from "../testdata/create-demandoutput.json";

test.describe(
  "Demandoutput Page Features (tests for regarding table data)",
  { tag: "@Smoke @DemandOutput @Regression @ibg-centrifuge-ui" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });
    test(
      "Demand page To Select Filters from drop down and verify in table",
      { tag: "@OpenDemandOutput" },
      async () => {
        test.setTimeout(500000);
        await test.step("Open the demand stack scenario", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openFirstDSS();
        });
        await test.step("Select SBU from drop down and verify in table", async () => {
          await objpageFactory.cdfPageFactory().demandOutput().selectionToSBU();
        });
        await test.step("Check Selected SBU from drop down and retain in filters", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandOutput()
            .selectionSBUAndRetention();
        });
        await test.step("Download Excel with GMV Metric", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandOutput()
            .downloadExcelWithGmvMetric();
        });
      }
    );
  }
);
