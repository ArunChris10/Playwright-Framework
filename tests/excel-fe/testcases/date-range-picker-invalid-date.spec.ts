import { test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Date Range Picker Invalid Date Test",
  {
    tag: "@Regression @Smoke @ExcelPlugin @ExcelDateRangePicker @ExcelDateRangePickerInvalidRange",
  },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
    });

    test("Verify date range picker exists and shows default fiscal year", async () => {
      await excelPage.verifyInvalidDate();
    });

    test.afterAll(async () => {
      await excelPage.closeDateRangePicker();
    });
  }
);
