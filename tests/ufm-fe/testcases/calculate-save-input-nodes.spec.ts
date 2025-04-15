import { testData } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import commonData from "../../ufm-be/constants/common.json"
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';

let lobList = {
    "Merchandising finance": ["SCHEDULED"]
    // "Supply Chain": ["LAST MILE DELIVERY"]
}
Object.entries(lobList).forEach(([org, lob]) => {

    for (let i = 0; i < lob.length; i++) {
        test.describe('Calculate and Save input node', { tag: "@Smoke @calculateAndSaveInputNode" }, async () => {
            test.describe.configure({ timeout: 800_000, mode: "serial" });
            let objpageFactory: PageFactory;
            let adjustmentName

            let scenarioId
            let scenario_details

            test.beforeAll(async ({ pageFactory, request }) => {
                objpageFactory = pageFactory;
                scenarioId = await ForecastUtility.createForecast(lob[i].toUpperCase(), request);

                let currentForecast = await UfmUtility.getCurrentForecastList(
                    lob[i],
                    request
                );

                scenario_details = await UfmUtility.getScenarioDetails(
                    currentForecast,
                    scenarioId
                );

            })

            test.afterAll(async ({ request }) => {
                await ForecastUtility.deleteForecast(
                    scenario_details["scenarioId"],
                    scenario_details["scenarioVersion"],
                    commonData.ba_dim_id,
                    await UfmUtility.getMapping(lob, "dim_val_id"),
                    request
                );
            })

            test('Verify inputter can calculate and save changes for multiple input nodes', { tag: "@calculateInputNode" }, async () => {
                test.setTimeout(300000);

                await test.step('Go To UFM Page', async () => {
                    await objpageFactory.ufmPageFactory().organisationSelection().navigate();
                })
                await test.step(`Click on ${org} Organization`, async () => {
                    await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(org);
                })

                await test.step(`Click on Open ${org} Frecast`, async () => {
                    await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(lob[i])
                })

                await test.step('Click on choose different drivers', async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDifferentDriver()
                })

                await test.step('Click on input drivers tab', async () => {
                    await objpageFactory.ufmPageFactory().addDriverPage().toggleToInputDriversTab()
                })

                await test.step(`Select all input drivers`, async () => {
                    await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()

                    await objpageFactory.ufmPageFactory().addDriverPage().selectAllInputDrivers()

                })


                await test.step("Click on Apply Drivers", async () => {
                    await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers()
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
    }


})
