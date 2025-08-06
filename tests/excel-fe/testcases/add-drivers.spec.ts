import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { PageFactory } from "../../common/pages/page-factory";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Excel AddIn Drivers Selection Tests",
  { tag: "@Regression @Smoke @ExcelPlugin @AddDrivers @ibg-ufm-metadata-service @ibg-ufm-core-service" },
  async () => {
    test.describe.configure({ mode: "serial" });
    let excelPage: ExcelPage;
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
    });

    test("Verify 'Driver' button exists and clicking which opens the drivers popup", async () => {
      await excelPage.selectDrivers();
      await expect(excelPage.addDriver).toBeEnabled();
      await excelPage.openElementByType("button", "Add driver");
      expect(
        await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()
      ).toBeTruthy();
    });

    test("Adding inputs and calculated node and validating the results in the table", async () => {
      const driverNames = ["Total Allowances (MO)", "Post Audit (MO)"];
      await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(driverNames);
      await excelPage.selectScenario();
      await excelPage.loadData();
      let color = await excelPage.getCellColor("B3");
      Utility.logIt("B3 cell color:" + color);
      expect(color).toBe("#D6D6D6");

      color = await excelPage.getCellColor("B4");
      Utility.logIt("B4 cell color:" + color);
      expect(color).toBe("#FFFFDF");
    });
  }
);
