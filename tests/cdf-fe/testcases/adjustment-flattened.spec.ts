import { test, expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { PageFactory } from "../../common/pages/page-factory";
import testdata from "../testdata/create-demandstackscenario.json";
import testDataFlattened from "../testdata/create-manualadjustment-flattened.json";

test.describe(
  "Manual Adjustment Flattened Layer Page Features",
  {
    tag: "@Smoke @ManualAdjustmentFlattened @ibg-service-scenario-financials @Regression",
  },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objPageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objPageFactory = pageFactory;
      await objPageFactory.cdfPageFactory().demandWorkspace().navigate();
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

test.describe(
  "Manual Adjustment Flattened Layer Excel and CSV Download",
  {
    tag: "@Smoke @Regression @ManualAdjustmentFlattenedDownload @ibg-service-scenario-financials",
  },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    test("Verify user can download excel and csv file for manual adjustment flattened layer", async ({
      pageFactory,
    }) => {
      const monthYear = Utility.getMonthYear();
      const year = monthYear.substring(0, 4);
      const month = monthYear.substring(4);
      let editedSBU;

      await test.step("Navigate to a DSS", async () => {
        await pageFactory.cdfPageFactory().demandWorkspace().navigate();
        await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
      });

      await test.step("Create Manual Adjustment Flattened Layer ", async () => {
        await pageFactory
          .cdfPageFactory()
          .flattenedManualAdjustmentLayer()
          .createAndSave();
      });

      await test.step("Edit cell for first GMV & SBU row and current month+1 column to defautMetricValue", async () => {
        editedSBU = await pageFactory
          .cdfPageFactory()
          .flattenedManualAdjustmentLayer()
          .editGMVAndSBUCell();
        await pageFactory
          .cdfPageFactory()
          .flattenedManualAdjustmentLayer()
          .calculateUpdatedCells();
      });

      await test.step("CSV download", async () => {
        const csvArray = (await pageFactory
          .cdfPageFactory()
          .flattenedManualAdjustmentLayer()
          .download("CSV")) as string[][];
        const sumOfGMV = csvArray
          .filter(
            (row) => row[1] === year && row[2] === month && row[5] === editedSBU
          )
          .reduce((acc, row) => acc + Number(row[10]), 0);
        expect(Math.round(sumOfGMV)).toEqual(
          Number(testDataFlattened.defaultMetricValue)
        );
      });

      await test.step("Excel download", async () => {
        const sheet = (await pageFactory
          .cdfPageFactory()
          .flattenedManualAdjustmentLayer()
          .download("Excel")) as Array<any>;
        const columns = sheet[4];
        const monthYearValue =
          Utility.convertFYMonthNumberToName(month) + "\nFY " + year;
        const keyOfEditedCell = Object.keys(columns).find(
          (key) => columns[key] === monthYearValue
        ) as string;
        const editedRow = sheet.find(
          (row) =>
            row["Selection Panel"] === testDataFlattened.metricGMV &&
            row["__EMPTY"] === editedSBU
        ) as any;
        expect(Math.round(editedRow[keyOfEditedCell])).toEqual(
          Number(testDataFlattened.defaultMetricValue)
        );
      });
    });
  }
);
