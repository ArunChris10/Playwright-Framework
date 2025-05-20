import { test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";
import { expect } from "@playwright/test";

test.describe(
  "Excel AddIn Generic Tests",
  { tag: "@Regression @Smoke @ExcelPlugin @ExceAddIn" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
    });

    test("should have a 'Get Started' button on the welcome page", async () => {
      await expect(excelPage.getStartedBtn).toBeVisible();
    });

  }
);
