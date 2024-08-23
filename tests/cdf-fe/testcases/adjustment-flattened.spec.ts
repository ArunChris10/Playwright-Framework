import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";
import testdata from "../testdata/create-demandstackscenario.json";

test.describe(
  "Manual Adjustment Flattened Layer Page Features",
  { tag: "@Smoke @ManualAdjustmentFlattened @ibg-service-scenario-financials @Regression" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objPageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objPageFactory = pageFactory;
      await objPageFactory
        .cdfPageFactory()
        .demandWorkspace()
        .navigate();
    });

    test.afterAll(async () => {
      await objPageFactory.cdfPageFactory().demandWorkspace().navigate();
      await objPageFactory
        .cdfPageFactory()
        .demandWorkspace()
        .deleteScenario(testdata.dssName);
    });

    test(
      "Manual Adjustment Flattened Layer page can be triggered",
      { tag: "@ManualAdjustmentFlattened" },
      async () => {
        test.setTimeout(500000);

        await test.step("Open the copy dialog", async () => {
          await objPageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openMenuOptionFromExistingScenario("copy");
        });

        await test.step("Create a new scenario in the copy dialog", async () => {
          await objPageFactory
            .cdfPageFactory()
            .copyScenario()
            .createNewDemandScenario(testdata.dssName, testdata.description);
          await objPageFactory
            .cdfPageFactory()
            .copyScenario()
            .verifyCopyConfirmation(testdata.msgCopyStarted);
        });

        await test.step("Open the newly created dss", async () => {
          await objPageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openFirstDSS();
        });

        await test.step("Create and Save Manual Adjustment Flattened Layer ", async () => {
          await objPageFactory
            .cdfPageFactory()
            .flattenedManualAdjustmentLayer()
            .createAndSave();
        });

        await test.step("When Editing GMV, hold GMV should not be allowed", async () => {
          await objPageFactory
            .cdfPageFactory()
            .flattenedManualAdjustmentLayer()
            .editGMVCell();
        });

        await test.step("When Editing Units, hold units should not be allowed", async () => {
          await objPageFactory
            .cdfPageFactory()
            .flattenedManualAdjustmentLayer()
            .editUnitsCell();
        });

        await test.step("When Editing GMV and Units, hold AUR should not be allowed", async () => {
          await objPageFactory
            .cdfPageFactory()
            .flattenedManualAdjustmentLayer()
            .editGMVandUnitsCells();
        });
      }
    );
  }
);