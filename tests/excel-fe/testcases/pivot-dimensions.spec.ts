import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Select Dimension in save view",
  { tag: "@Regression @Smoke @ExcelPlugin @ExcelPivotDimension" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
    });

    test("Show Totals Button should be visible", async () => {
      // Opens the Dimension Selection.
      await excelPage.selectDimension(true);

      let response: any;

      // Checks if the "Show Totals" checkbox is disabled - should return true.
      response = await excelPage.isDimensonDisabled("Show Totals");
      expect(response).toBeTruthy();

      await excelPage.selectDimension(false, "SBU");

      // Checks if the "Show Totals" checkbox is disabled - should return false.
      response = await excelPage.isDimensonDisabled("Show Totals");
      expect(response).toBeFalsy();

      await excelPage.selectDimension(false, "SBU");
      // Checks if the "Show Totals" checkbox is disabled - should return true.
      response = await excelPage.isDimensonDisabled("Show Totals");
      expect(response).toBeTruthy();
    });
  }
);
