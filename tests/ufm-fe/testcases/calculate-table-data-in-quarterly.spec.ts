import { testAdditiveDataQuarter } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

testAdditiveDataQuarter.forEach(forecastNodeDetail => {

    test.describe('Calculate and Save input node quarterly view', { tag: "@Smoke @calculateAdditiveQuarterlyView @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {
        let data = forecastNodeDetail
        let objpageFactory: PageFactory;
        let inputNodeValues;
        let calculateErrorMessageExistence;
        let saveErrorMessageExistence;
        let allocateErrorMessageExistence;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test('Verify inputter can calculate and save changes for input nodes', { tag: "@calculateInputNode" }, async () => {
            test.setTimeout(300000);

            await test.step('Go To UFM Page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            })
            await test.step(`Click on ${data.sbaName} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.sbaName);
            })

            await test.step(`Click on Open ${data.LOB} Forecast`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().waitForForecastToLoad()
                await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(data.LOB)
            })

            await test.step('Click on choose different drivers', async () => {
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

            await test.step('Update page view to quarterly', async () => {
                await objpageFactory.ufmPageFactory().updatePageCalendarView().selectInterval('quarter')
            })
            await test.step(`Enter forecast value ${data.driver.forecastValue} for first ${data.driver.noOfQuarter} quarter`, async () => {
                inputNodeValues = await objpageFactory.ufmPageFactory().openCurrentForecast().fillForecastQuarterInputCell(data.driver.noOfQuarter, data.driver.forecastValue)
            })

            await test.step(`Select allocation method as ${data.driver.allocationMethod}`, async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton()
                allocateErrorMessageExistence = await objpageFactory.ufmPageFactory().openCurrentForecast().allocationErrorMessageExistence()
                expect(allocateErrorMessageExistence).toBeTruthy()
                await objpageFactory.ufmPageFactory().openCurrentForecast().selectAllocationMethod(data.driver.allocationMethod)
            })

            await test.step('Click on Calculate for additive node in quarterly view', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton()
                expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy()
                await objpageFactory.ufmPageFactory().openCurrentForecast().waitForCalculationSuccessMessage()

            })

            await test.step('Click on Save for additive node in quarterly view', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSave()
                expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy()
                saveErrorMessageExistence = await objpageFactory.ufmPageFactory().openCurrentForecast().saveErrorMessageExistence()
                await expect(saveErrorMessageExistence).toBeFalsy()
            })

            await test.step('Validate the inputted value persist after clicking on save', async () => {
                let currentInputNodeValues = await objpageFactory.ufmPageFactory().openCurrentForecast().getDriverMonthForecastValue(inputNodeValues["updated_col_ids"])

                expect(inputNodeValues["updated_col_ids"].size).toBe(currentInputNodeValues.size);

                for (const [key, value] of inputNodeValues["updated_col_ids"]) {

                    expect(currentInputNodeValues.has(key)).toBeTruthy();
                    expect(currentInputNodeValues.get(key)).toBe(value);
                }
            })


        })
    })
})