import { testData } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test } from "../../common/fixtures/test-hook";

let lobList = {
    "Merchandising finance": ["SCHEDULED"]
}
Object.entries(lobList).forEach(([org, lob]) => {

    for (let i = 0; i < lob.length; i++) {
        test.describe('Varify forecast comparison functionality', { tag: "@Smoke @forecastcomparison" }, async () => {
            test.describe.configure({ timeout: 800_000, mode: "serial" });
            let objpageFactory: PageFactory;

            test.beforeAll(async ({ pageFactory, request }) => {
                objpageFactory = pageFactory;

            })


            test('Verify inputter can apply comparisons on forecast data for input nodes', { tag: "@forecastcomparison" }, async () => {
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


                await test.step(`Search for input driver ${testData[0].driver.inputDriver}`, async () => {
                    await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad();
                    await objpageFactory.ufmPageFactory().addDriverPage().inputDriverName(testData[0].driver.inputDriver);

                });

                await test.step(`Select input driver ${testData[0].driver.inputDriver}`, async () => {
                    await objpageFactory.ufmPageFactory().addDriverPage().selectDriver(testData[0].driver.inputDriver);

                });


                await test.step("Click on Apply Drivers", async () => {
                    await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers()
                })

                await test.step("Wait for KPI table to load", async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad()
                })

                await test.step('Click on Compare Button', async () => {
                    await objpageFactory.forecastComparisonPageFactory().clickOnCompare();
                })

            })
        })
    }


})
