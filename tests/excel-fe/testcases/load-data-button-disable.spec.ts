import { expect, test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Load Data Button Disable",
  { tag: "@Regression @ExcelPlugin @LoadDataButtonDisable @ibg-excel-addin" },
  async () => {
    let excelPage: ExcelPage;
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
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

    test("Clicking load data with filters selected which does not have the data should show error banner", async () => {
      await excelPage.selectBusinessArea(
        "Merchandising Operations  /  Merchops"
      );
      await excelPage.selectDrivers();
      await expect(excelPage.addDriver).toBeEnabled();
      await excelPage.openElementByType("button", "Add driver");
      expect(
        await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()
      ).toBeTruthy();
      const driverNames = ["Buying Allowances (MO)"];
      await objpageFactory
        .ufmPageFactory()
        .addDriverPage()
        .searchAndApplyDrivers(driverNames);
      await excelPage.selectScenario();
      await excelPage.selectFilters();
      await expect(excelPage.loadDataButton).toBeEnabled();
      await excelPage.loadData();
      await excelPage.page.waitForTimeout(10000);
      await expect(excelPage.bannerDismiss).toBeVisible();
    });
  }
);
