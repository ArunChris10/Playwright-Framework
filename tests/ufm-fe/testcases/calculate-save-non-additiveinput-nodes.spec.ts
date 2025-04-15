import { testData } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

testData.forEach(forecastNodeDetail => {

    test.describe('Calculate and Save input node', { tag: "@Smoke @calculateAndSaveNonAdditiveInputNode" }, async () => {
        let data = forecastNodeDetail
        let objpageFactory: PageFactory;
        let inputNodeValues;
        let calculateErrorMessageExistence;
        let saveErrorMessageExistence;
        let allocateErrorMessageExistence;
        let adjustmentName;

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

            await test.step(`Click on Open ${data.LOB} Frecast`, async () => {
               
                await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(data.LOB)
            })

            await test.step('Click on choose different drivers', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDriver()
            })

            // await test.step(`Search for input driver: ${data.driver.inputDriver}`, async () => {
            //     await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()
            //     await objpageFactory.ufmPageFactory().addDriverPage().inputDriverName(data.driver.inputDriver)
            // })

            // await test.step(`Select the input driver : ${data.driver.inputDriver}`, async () => {
            //     await objpageFactory.ufmPageFactory().addDriverPage().selectDriver(data.driver.inputDriver)
            // })

            // await test.step("Click on Apply Drivers", async () => {
            //     await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers()
            // })

            await test.step(`Search for input driver: ${data.driver.inputDriver}`, async () => {
                await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(data.driver.inputNonAdditiveDrivers)
               
            })
            
            await test.step("Wait for KPI table to load", async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad()
            })

            await test.step('Input number in all valid cell/non-empty cell', async () => {
                let map = await objpageFactory.ufmPageFactory().openCurrentForecast().inputValueInAllValidInputCell("3333")

            })


            await test.step('Click on Calculate', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton()
                expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy()
                await objpageFactory.ufmPageFactory().openCurrentForecast().waitForCalculationSuccessMessage()

            })

            await test.step('Click on Save as change', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveAsChange()

            })

            await test.step('Provide name and description in save as change form', async () => {
                adjustmentName = "Change 2"
                await objpageFactory.ufmPageFactory().openCurrentForecast().fillChangeForm(adjustmentName, "Test description created through automation")
            })

            await test.step('Click on Save Changes', async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveChanges()
                expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy()
                expect(await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveChanges())
            })

            await test.step("Wait for KPI table to load", async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad()
            })

            await test.step('Validate save is changed', async () => {
                let changesList = await objpageFactory.ufmPageFactory().openCurrentForecast().getAllChanges()

                expect(changesList[0]).toEqual(adjustmentName)
            })


        })
    })



})