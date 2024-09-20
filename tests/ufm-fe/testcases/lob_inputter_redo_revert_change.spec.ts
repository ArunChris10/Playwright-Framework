import { testData } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

testData.forEach(forecastNodeDetail => {
    test.describe('LOB inputter reverts change', { tag: "@Smoke @revertLOBInput" }, async () => {
        let data = forecastNodeDetail
        let objpageFactory: PageFactory;
        let inputNodeValues;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test('Verify when LoB Inputter press undo button, it revert changes back to the previous value', { tag: "@undoLOBInput" }, async () => {
            test.setTimeout(300000);

            await test.step('Go To UFM Page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            })
            await test.step(`Click on ${data.sbaName} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.sbaName);
            })

            await test.step(`Click on Open ${data.LOB} Frecast`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().waitForForecastToLoad()
                await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(data.LOB)
            })

            await test.step('Click on Add driver', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDifferentDriver()
            })

            await test.step(`Search for input driver: ${data.driver.inputDriver}`, async () => {
                await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()
                await objpageFactory.ufmPageFactory().addDriverPage().inputDriverName(data.driver.inputDriver)
            })

            await test.step(`Select the input driver : ${data.driver.inputDriver}`, async () => {
                await objpageFactory.ufmPageFactory().addDriverPage().selectDriver(data.driver.inputDriver)
            })

            await test.step("Click on Apply Drivers", async () => {
                await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers()
            })

            await test.step('Validate added driver is listed on the KPI forecast Page', async () => {
                expect(await objpageFactory.ufmPageFactory().openCurrentForecast().validateDriverPresence(data.driver.inputDriver)).toBeTruthy()
            })

            await test.step(`Enter forecast value ${data.driver.forecastValue} for first ${data.driver.noOfMonth} month/months`, async () => {
                inputNodeValues = await objpageFactory.ufmPageFactory().openCurrentForecast().fillForecastInputCell(data.driver.noOfMonth, data.driver.forecastValue)
            })

            await test.step('Revertting inputted changes by pressing keyboard undo', async () => {
                for (let i = 0; i <= data.driver.noOfMonth; i++) {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnUndo()
                }
            })


            await test.step('Validate the old value persist after clicking on undo', async () => {
                let revertedInputNodeValues = await objpageFactory.ufmPageFactory().openCurrentForecast().getDriverMonthForecastValue(inputNodeValues.updated_col_ids)

                expect(inputNodeValues["old_col_ids"].size).toBe(revertedInputNodeValues.size);

                for (const [key, value] of inputNodeValues["old_col_ids"]) {
                    expect(revertedInputNodeValues.has(key)).toBeTruthy();
                    expect(revertedInputNodeValues.get(key)).toBe(value);
                }
            })

        })

        test('Verify when LoB Inputter press redo button, it redoes the updated value', { tag: "@redoLOBInput" }, async () => {
            await test.step('Click on Redo', async () => {
                for (let i = 0; i <= data.driver.noOfMonth; i++) {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnRedo()
                }
            })


            await test.step('Validate the inputted value persist after clicking on redo', async () => {
                let revertedInputNodeValues = await objpageFactory.ufmPageFactory().openCurrentForecast().getDriverMonthForecastValue(inputNodeValues.updated_col_ids)

                expect(inputNodeValues["updated_col_ids"].size).toBe(revertedInputNodeValues.size);

                for (const [key, value] of inputNodeValues["updated_col_ids"]) {
                    expect(revertedInputNodeValues.has(key)).toBeTruthy();
                    expect(revertedInputNodeValues.get(key)).toBe(value);
                }
            })
        })
    })
})
