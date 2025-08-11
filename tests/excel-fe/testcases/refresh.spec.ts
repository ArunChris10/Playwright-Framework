import { expect, test } from "../../common/fixtures/test-hook";
import { ExcelPage } from "../pages/excel.page";

test.describe(
    "Refresh All",
    { tag: "@Regression @ExcelPlugin @Refresh @ibg-excel-addin" },
    async () => {
        const sheetNames = ["Sheet1", "Sheet2"]
        let excelPage: ExcelPage;

        test.beforeAll(async ({ pageFactory }) => {
            await pageFactory.loginExcel().login();
            excelPage = pageFactory.excel();
            await excelPage.getStarted();
        });

        test.afterAll(async () => {
            // Cleanup: Delete created/modified sheets
            await excelPage.deleteSheet(sheetNames[0])
            await excelPage.excelUIElements.buttons.newSheet.click();
            await excelPage.deleteSheet(sheetNames[1])
        })

        test("Verify refresh button displays after download is completed", async () => {
            await excelPage.doDownload("Merchandising Operations  /  Merchops")
            await expect(excelPage.buttons.refresh).toBeEnabled();
        });

        test("Verify clicking the refresh button reloads the data", async () => {
            const modifiedData = "1";
            const modifiedCell = "B3"

            await excelPage.setCellData(modifiedCell, modifiedData)
            await excelPage.buttons.refresh.click()

            const updatedData = await excelPage.getCellTextAfterLoad("B3");

            expect(updatedData).not.toBe(modifiedData)
        })

        test("Verify settings panel shows enabled for Refresh All after performing download", async () => {
            const sheetOneRefreshSwitch = excelPage.getRefreshSwitchForTab(sheetNames[0]);

            await excelPage.buttons.settings.click();
            await expect(sheetOneRefreshSwitch).toBeVisible();
        });

        test("Verify that back navigation from the settings screen is possible", async () => {
            await excelPage.buttons.back.click();
            await expect(excelPage.businessArea).toBeVisible();
        })

        test("Verify that a new sheet download also appears in the refresh settings", async () => {
            const sheetOneRefreshSwitch = excelPage.getRefreshSwitchForTab(sheetNames[0]);
            const sheetTwoRefreshSwitch = excelPage.getRefreshSwitchForTab(sheetNames[1])
            await excelPage.excelUIElements.buttons.newSheet.click();
            await excelPage.doDownload("Merchandising Operations  /  Merchops");

            await excelPage.buttons.settings.click();
            await expect(sheetOneRefreshSwitch).toBeVisible();
            await expect(sheetTwoRefreshSwitch).toBeVisible();
            await excelPage.buttons.back.click();
        })

        test("Verify that refresh all is available and refreshes tabs when two enabled tabs exist", async () => {
            const modifiedData = "1"
            const modifiedCell = "B3"

            await excelPage.switchToSheet(sheetNames[0])
            await excelPage.setCellData(modifiedCell, modifiedData)

            await excelPage.switchToSheet(sheetNames[1])
            await excelPage.setCellData(modifiedCell, modifiedData)

            await excelPage.buttons.moreRefreshOptions.click()
            await excelPage.buttons.refreshAll.click()

            const firstSheetData = await excelPage.getCellTextAfterLoad(modifiedCell)
            expect(firstSheetData).not.toBe(modifiedData)

            await excelPage.switchToSheet(sheetNames[0])

            const secondSheetData = await excelPage.getCellTextAfterLoad(modifiedCell)
            expect(secondSheetData).not.toBe(modifiedData)
        })

        test("Verify the refresh button reverts to download button after changing selection", async () => {
            await excelPage.switchToSheet(sheetNames[0])
            await excelPage.selectNthScenario(1)
            await expect(excelPage.buttons.download).toBeEnabled();
        })
    }
);