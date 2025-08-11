import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
  "Excel AddIn Generic Tests",
  { tag: "@Regression @Smoke @ExcelPlugin @ScenarioComparison @ibg-excel-addin" },
  async () => {
    let excelPage: ExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      await pageFactory.loginExcel().login();
      excelPage = pageFactory.excel();
      await excelPage.getStarted();
      await excelPage.selectBusinessArea();
    });

    test("Verify add-comparision button exists and clicking which opens the comparision panel", async () => {
      await excelPage.openElementByType("button", "Add comparison");
      await excelPage.openElementByType("radio", "vs Time Period");

      // Add scenario should be disabled until we select a scenario
      await expect(excelPage.addComparedScenario).toBeDisabled();

      await excelPage.clickElementByRole("baselineCombobox");

      // Add scenario should be enabled.
      await expect(excelPage.addComparedScenario).toBeEnabled();

      await excelPage.openElementByType("radio", "vs Scenario");

      // Add scenario should be disabled until we select a scenario
      await expect(excelPage.addComparedScenario).toBeDisabled();

      await excelPage.clickElementByRole("baselineCombobox");
      await excelPage.clickElementByRole("comparedWithCombobox");

      // Add scenario should be enabled.
      await expect(excelPage.addComparedScenario).toBeEnabled();
    });
  }
);
