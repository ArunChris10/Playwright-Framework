import { test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Date Range Picker Test",
  { tag: "@Regression @Smoke @ExcelPlugin @ExcelDateRangePicker" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
    });

    test("Verify date range picker exists and shows default fiscal year", async () => {
      await excelPage.openDateRangePicker();
      await excelPage.verifyDateRangePickerShowsDefaultFiscalYear();
    });

    test.afterAll(async () => {
      await excelPage.closeDateRangePicker();
    });
  }
);
