import { test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";
import { Utility } from "../../common/fixtures/utils";

test.describe(
  "Create Saved View Configuration",
  { tag: "@Regression @Smoke @ExcelPlugin @ExcelSavedConfigurations" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
      await excelPage.selectSavedView();
      await excelPage.selectScenario();
    });

    test("Load Data (Save Configurations)", async () => {
      await excelPage.loadData();
    });

    test("Clear Whitespace", async () => {
      let cellData: string | null;

      // Assuming cell ZZ5000 doesnot have any data.
      await excelPage.setCellData("ZZ5000", "testCellValue");
      cellData = await excelPage.getCellData("ZZ5000");
      Utility.logIt(`Cell ZZ5000 Data Before:  ${cellData}`);

      await excelPage.loadData();
      await excelPage.page.waitForTimeout(120000);

      cellData = await excelPage.getCellData("ZZ5000");
      Utility.logIt(`Cell ZZ5000 Data After:  ${cellData}`);

      test.expect(cellData).toBe("testCellValue");
    });
  }
);

test.describe(
  "Verify Saved View Configuration",
  { tag: "@Regression @Smoke @ExcelPlugin @ExcelSavedConfigurations" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
    });

    test("Verify Saved Configurations", async () => {
      await excelPage.verifySavedConfigurations();
    });
  }
);
