import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Load Data Button Disable",
  { tag: "@Regression @ExcelPlugin @LoadDataButtonDisable" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
    });

    test("Verify Load Data button is disabled initially", async () => {
      await expect(excelPage.loadDataButton).toBeDisabled();
    });

    test("Verify Load Data button is enabled after required selections", async () => {
      await excelPage.selectBusinessArea(
        "Merchandising Operations  /  Merchops"
      );
      await excelPage.selectSavedView();
      await excelPage.selectScenario();
      await expect(excelPage.loadDataButton).toBeEnabled();
    });

    test("Verify Load Data button is disabled if Scenarios selection removed", async () => {
      await excelPage.selectScenario(); // unchecks checkbox
      await expect(excelPage.loadDataButton).toBeDisabled();
      await excelPage.selectScenario(); // rechecks checkbox
    });

    test("Verify Clear button removes selections and disables Load Data button", async () => {
      await excelPage.clearSelections();
      await expect(
        excelPage.mainIframe.getByText("Please select")
      ).toBeVisible();
      await expect(excelPage.savedView).toBeHidden();
      await expect(excelPage.loadDataButton).toBeDisabled();
    });
  }
);
