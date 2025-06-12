import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Excel AddIn Drivers Selection Tests",
  { tag: "@Regression @Smoke @ExcelPlugin @AddDrivers" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
    });

    test("Verify 'Driver' button exists and clicking which opens the drivers popup", async () => {
      await excelPage.selectDrivers();
      await expect(excelPage.addComparedScenario).toBeEnabled();
      await excelPage.openElementByType("button", "Add driver");
    });
  }
);
