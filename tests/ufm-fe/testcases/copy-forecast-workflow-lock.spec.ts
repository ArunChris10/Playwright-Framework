import { expect, test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";
import commonData from "../../ufm-be/constants/common.json";
import { ForecastUtility } from "../../ufm-be/fixtures/forecast-utils";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { testData } from '../testdata/inputNodeValues.json';

test.describe(
    "Verify user is not be able to edit the nodes while copy scenario is in progress",
    { tag: "@CopyScenarioWorkflowLock @Regression @CopyScenario @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" },
    () => {
        let objpageFactory: PageFactory, data = testData[0], sourceScenarioId, sourceScenarioDetails, targetScenarioId, targetScenarioDetails;

        test.beforeAll(async ({ pageFactory, request }) => {
            objpageFactory = pageFactory;
            sourceScenarioId = await ForecastUtility.createForecast(
                data.LOB,
                request,
            );
            targetScenarioId = await ForecastUtility.createForecast(
                data.LOB,
                request,
            );

            let currentForecast = await UfmUtility.getCurrentForecastList(
                data.LOB,
                request
            );

            sourceScenarioDetails = await UfmUtility.getScenarioDetails(
                currentForecast,
                sourceScenarioId
            );
            targetScenarioDetails = await UfmUtility.getScenarioDetails(
                currentForecast,
                targetScenarioId
            );
        });
        test.afterAll(async ({ request }) => {
            await ForecastUtility.deleteForecast(
                sourceScenarioDetails["scenarioId"],
                sourceScenarioDetails["scenarioVersion"],
                commonData.ba_dim_id,
                await UfmUtility.getMapping(data.LOB, "dim_val_id"),
                request
            );
            await ForecastUtility.deleteForecast(
                targetScenarioDetails["scenarioId"],
                targetScenarioDetails["scenarioVersion"],
                commonData.ba_dim_id,
                await UfmUtility.getMapping(data.LOB, "dim_val_id"),
                request
            );
        });

        test(
            `Verify user should not be able to promote to BA review while copy scenario is in progress`,
            { tag: "@CopyScenarioWorkflowLock" },
            async () => {
                await test.step('Go To UFM Page', async () => {
                    await objpageFactory.ufmPageFactory().organisationSelection().navigate();
                })
                await test.step(`Click on ${data.sbaName} Organization`, async () => {
                    await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.sbaName);
                })

                await test.step(`Click on Open ${sourceScenarioDetails["name"]} Forecast`, async () => {
                    await objpageFactory.ufmPageFactory().currentForecast().clickOpenForecastByName(sourceScenarioDetails["name"])
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

                await test.step("Wait for KPI table to load", async () => {
                    await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad()
                })

                await test.step('Input number in all valid cell/non-empty cell', async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().inputValueInAllValidInputCell("3333")
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
                    await objpageFactory.ufmPageFactory().openCurrentForecast().fillChangeForm("Test change", "Test change description")
                })

                await test.step('Click on Save Changes', async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveChanges()
                    expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy()
                    expect(await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveChanges())
                })

                await test.step("Navigate back to scenario list page", async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnBreadcrum(data.sbaName)
                })

                await test.step(`Click on Open ${targetScenarioDetails["name"]} Forecast`, async () => {
                    await objpageFactory.ufmPageFactory().currentForecast().clickOpenForecastByName(targetScenarioDetails["name"])
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

                await test.step("Wait for KPI table to load", async () => {
                    await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad()
                })

                await test.step("Copy forecast data from source to target scenario", async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnActionButton()
                    await objpageFactory.ufmPageFactory().copyForecastPage().clickOnCopyForecastDataButton()
                    await objpageFactory.ufmPageFactory().copyForecastPage().selectSourceForecastDropdown(sourceScenarioDetails["name"]);
                    await objpageFactory.ufmPageFactory().copyForecastPage().selectDestinationForecastDropdown(targetScenarioDetails["name"]);
                    await objpageFactory.ufmPageFactory().copyForecastPage().clickOnCopyDataButton();
                    await objpageFactory.ufmPageFactory().openCurrentForecast().waitForMessage(`Data load from ${sourceScenarioDetails["name"]} has started. This process may take up to 10 minutes. You’ll be notified once it’s complete.`)
                })

                await test.step("Navigate back to scenario list page", async () => {
                    await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnBreadcrum(data.sbaName)
                })

                await test.step(`Verify promotion of ${targetScenarioDetails["name"]} Forecast to BA review to be disabled`, async () => {
                    expect(await objpageFactory.ufmPageFactory().currentForecast().isSendToReviewEnabled(data.sbaName)).toBeFalsy()
                })
            }
        );
    }
);