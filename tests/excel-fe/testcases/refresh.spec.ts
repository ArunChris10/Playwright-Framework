import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
    "Refresh Button Functionality",
    { tag: "@Regression @ExcelPlugin @RefreshButton" },
    async () => {
        let excelPage: ExcelPage;

        test.beforeAll(async ({ pageFactory }) => {
            await pageFactory.loginExcel().login();
            excelPage = pageFactory.excel();
            await excelPage.getStarted();
        });

        test("Verify refresh button displays after download is completed", async () => {
            await excelPage.selectBusinessArea(
                "Merchandising Operations  /  Merchops"
            );
            await excelPage.selectSavedView();
            await excelPage.selectNthScenario(0);

            await expect(excelPage.buttons.download).toBeEnabled();

            await excelPage.buttons.download.click();
            await expect(excelPage.buttons.refresh).toBeEnabled();
        });

        test("Verify the refresh button reverts to download button after changing selection", async () => {
            await excelPage.selectNthScenario(1)
            await expect(excelPage.buttons.download).toBeEnabled();
        })
    }
);
