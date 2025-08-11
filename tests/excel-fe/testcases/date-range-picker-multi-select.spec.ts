import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Date Range Picker Multi Time Granularity Test",
  {
    tag: "@Regression @Smoke @ExcelPlugin @ExcelDateRangePicker @ExcelDateRangePickerMultiGrains @ibg-excel-addin",
  },
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

    test("Verify multi granularity levels exist and can be checked", async () => {
      await excelPage.openDateRangePicker();
      await excelPage.selectMultiGrains();
      await excelPage.closeDateRangePicker();
    });

    test("Load Data", async () => {
      await excelPage.loadData();
    });

    test("Verify multi granularity levels are shown", async () => {
      let data = await excelPage.getTableData();

      let parentLength = data[0].filter((element) => element !== "").length;

      let years = data[0].filter((element) => element !== "");
      expect(years.length).toBe(parentLength);
      expect(
        years.filter((element) => /^FY[0-9]{2}/.test(element)).length
      ).toBe(parentLength);
      expect([...new Set(years)].length).toBe(1);

      let halfYears = data[1].filter((element) => element !== "");
      expect(halfYears.length).toBe(parentLength);
      expect(
        halfYears.filter((element) => /^FY[0-9]{2} H[0-9]/.test(element)).length
      ).toBe(parentLength);
      expect([...new Set(halfYears)].length).toBe(2);

      let quarters = data[2].filter((element) => element !== "");
      expect(quarters.length).toBe(parentLength);
      expect(
        quarters.filter((element) => /^FY[0-9]{2} Q[0-9]/.test(element)).length
      ).toBe(parentLength);
      expect([...new Set(quarters)].length).toBe(4);

      let months = data[3].filter((element) => element !== "");
      expect(months.length).toBe(parentLength);
      expect(
        months.filter((element) => /^[a-zA-Z]{3} [FY]/.test(element)).length
      ).toBe(parentLength);
      expect([...new Set(months)].length).toBe(parentLength);
    });
  }
);
