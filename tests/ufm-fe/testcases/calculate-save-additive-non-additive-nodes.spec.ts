import { testData, groupByOptions, filterOptions, HistoricalRatesTestData } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import commonData from "../../ufm-be/constants/common.json";
import { test, expect } from "../../common/fixtures/test-hook";
let allocationMethods = HistoricalRatesTestData[0];

allocationMethods.driver.allocationMethod.forEach((method: string) => {
        test.describe(
            'Calculate and Save additive and non-additive node',
            { tag: "@Smoke @calculateAndSaveAdditiveNonAdditiveInputNode" },
            async () => {
                let data = testData[0];;
                let objpageFactory: PageFactory;
                let adjustmentName;
                let scenarioId;
                let scenario_details;
                let inputCellLocator;
                let calculatedForecastValue;
                const driverTypes = [
                    { type: "Additive", drivers: data.driver.inputAdditiveDrivers },
                    { type: "Non-Additive", drivers: data.driver.inputNonAdditiveDrivers }
                ];

                test.beforeAll(async ({ pageFactory, request }) => {
                    objpageFactory = pageFactory;
                    scenarioId = await ForecastUtility.createForecast(data.LOB, request);

                    let currentForecast = await UfmUtility.getCurrentForecastList(
                        data.LOB,
                        request
                    );

                    scenario_details = await UfmUtility.getScenarioDetails(
                        currentForecast,
                        scenarioId
                    );
                });

                test.afterAll(async ({ request }) => {
                    await ForecastUtility.deleteForecast(
                        scenario_details["scenarioId"],
                        scenario_details["scenarioVersion"],
                        commonData.ba_dim_id,
                        await UfmUtility.getMapping(data.LOB, "dim_val_id"),
                        request
                    );
                });

                for (const driverType of driverTypes) {
                    test(`Valid calculate and save changes for ${driverType.type} with allocation method: ${method} `, async () => {
                        test.setTimeout(300000);

                        await test.step(`Go To UFM Page for ${driverType.type} Drivers`, async () => {
                            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
                        });

                        await test.step(`Click on ${data.sbaName} Organization`, async () => {
                            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.sbaName);
                        });

                        await test.step(`Click on Open ${data.LOB} Forecast`, async () => {
                            await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(data.LOB);
                        });

                        await test.step('Click on choose different drivers', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDriver();
                        });

                        await test.step(`Search for input driver: ${driverType.drivers}`, async () => {
                            await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(driverType.drivers);
                        });

                        await test.step("Wait for KPI table to load", async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad();
                        });

                        await test.step(`Select allocation method: ${method}`, async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().selectAllocationMethod(method);
                        });

                        await test.step(`Get forecast input cell for driver: ${driverType.drivers[0]}`, async () => {
                            inputCellLocator = await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnProjectionMethodforGivenInputCell(driverType.drivers[0]);
                        });

                        await test.step('Input number in all valid cell/non-empty cell', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().inputValueInAllValidInputCell("1200");
                        });

                        await test.step('Click on Calculate', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton();
                            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy();
                            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForCalculationSuccessMessage();
                            calculatedForecastValue = await inputCellLocator.textContent();
                        });

                        await test.step('Click on Save as change', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveAsChange();
                        });

                        await test.step('Provide name and description in save as change form', async () => {
                            adjustmentName = `Change for ${driverType.type} Drivers`;
                            await objpageFactory.ufmPageFactory().openCurrentForecast().fillChangeForm(adjustmentName, "Test description created through automation");
                        });

                        await test.step('Click on Save Changes', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveChanges();
                            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy();
                            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveChanges());
                        });

                        await test.step("Wait for KPI table to load", async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad();
                        });

                        await test.step('Validate save is changed', async () => {
                            const changesList = await objpageFactory.ufmPageFactory().openCurrentForecast().getAllChanges();
                            expect(changesList).toContain(adjustmentName);
                            expect(await inputCellLocator.textContent()).toEqual(calculatedForecastValue);
                        });
                    });
                }
            }
        );
    });
