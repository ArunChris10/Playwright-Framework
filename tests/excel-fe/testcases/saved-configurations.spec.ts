import { test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

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
