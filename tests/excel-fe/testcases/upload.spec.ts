import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Excel AddIn Upload functionality",
  { tag: "@Regression @Smoke @ExcelPlugin @ExcelUpload @ibg-excel-addin" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
    });

    test("Verify Upload button is visible and clicking which opens the upload panel", async () => {
      await expect(excelPage.uploadBtn).toBeVisible();
      await excelPage.openUploadPanel();
      await expect(excelPage.backToFiltersNavigation).toBeVisible();
    });

    test("Opens the upload panel and verify elements are present", async () => {
      await expect(excelPage.uploadBtn).toBeVisible();
      await excelPage.openUploadPanel();
      await expect(excelPage.backToFiltersNavigation).toBeVisible();

      await expect(excelPage.uploadTextField).toBeVisible();
      await excelPage.uploadTextField.click();
      await excelPage.uploadTextArea.fill("Sample value for upload textarea");
      await expect(excelPage.uploadTextArea).toBeVisible();
      await excelPage.uploadTextArea.click();
      await excelPage.uploadTextArea.fill("Sample value for upload textarea");

      await expect(excelPage.uploadTypeCombobox).toBeVisible();
      await excelPage.selectUploadType();

      await excelPage.uploadData();
    });
  }
);
