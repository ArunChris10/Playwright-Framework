import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "Adjustment Layer Page Features (tests for regarding Allocation data)",
  { tag: "@Smoke @AdjustmentLayer" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });
    test(
      "Adjustment Layer page To Allocation and verify in table",
      { tag: "@AdjustmentLayer" },
      async () => {
        test.setTimeout(500000);
        await test.step("Open the demand stack scenario", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openFirstDSS();
        });
        await test.step("Create and Save Adjustment Layer", async () => {
          await objpageFactory
            .cdfPageFactory()
            .adjustmentLayer()
            .createAndSave();
        });
        await test.step("Preview Adjustment Layer and see it doesn't create Adjustment Layer", async () => {
          await objpageFactory
            .cdfPageFactory()
            .adjustmentLayer()
            .previewNotSaved();
        });
        await test.step("Load already created Adjustment Layer", async () => {
          await objpageFactory
            .cdfPageFactory()
            .adjustmentLayer()
            .loadSelectedLayer();
        });
      }
    );
  }
);

test.describe(
  "Verify EMT layer can be created and verified",
  { tag: "@Smoke @AdjustmentLayer @createEMTLayer" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });
    test(
      "Creation of EMT Layer",
      { tag: "@AdjustmentLayer" },
      async () => {
        test.setTimeout(500000);
        await test.step("Open the demand stack scenario", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openFirstDSS();
        });
        await test.step("Create and Save Adjustment Layer", async () => {
          await objpageFactory
            .cdfPageFactory()
            .adjustmentLayer()
            .createAndSave();
        });
        await test.step("Load already created Adjustment Layer", async () => {
          await objpageFactory
            .cdfPageFactory()
            .adjustmentLayer()
            .loadSelectedLayer();
        });
      }
    );
  }
);