import { testData, groupByOptions, filterOptions } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import commonData from "../../ufm-be/constants/common.json";
import { test, expect } from "../../common/fixtures/test-hook";

testData.forEach(forecastNodeDetail => {
    test.describe(
        'Calculate and Save when any filter combination is applied on additive and non-additive node',
        { tag: "@Smoke @calculateAndSaveFilteredInputNode" },
        async () => {
            let data = forecastNodeDetail;
            let objpageFactory: PageFactory;
            let adjustmentName;
            let scenarioId;
            let scenario_details;

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

            const driverTypes = [
                { type: "Additive", drivers: data.driver.inputAdditiveDrivers },
                { type: "Non-Additive", drivers: data.driver.inputNonAdditiveDrivers }
            ];

            for (const driverType of driverTypes) {
                test(
                    `Verify inputter can calculate and save changes for ${driverType.type} drivers when node is at lowest grain`,
                    async () => {
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
                            await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
                        });

                        await test.step("Select group by to select grains of nodes selected to see its lowest dimension", async () => {
                            for (const groupByOption of groupByOptions) {
                                for (const [, groupBySelection] of Object.entries(groupByOption.data)) {
                                    await test.step(`Select ${groupBySelection["option"]} group By Options`, async () => {
                                        await objpageFactory.ssdmPageFactory().applyFilter().clickOnGroupBy();
                                        await objpageFactory.ssdmPageFactory().applyFilter().selectGroupByOption(groupBySelection["option"]);
                                    });
                                }
                            }
                        });

                        for (const filterSet of filterOptions) {
                            const filters = filterSet.data;
                            for (const [, filterSelection] of Object.entries(filters)) {
                                const typedFilterSelection = filterSelection as {
                                    childDropDown: string;
                                    dropDown: string;
                                    option: string;
                                };

                                await test.step(
                                    `Select ${typedFilterSelection.childDropDown} ${typedFilterSelection.dropDown} ${typedFilterSelection.option} filter options`,
                                    async () => {
                                        await objpageFactory.ssdmPageFactory().applyFilter().clickOnFiltersButton();
                                        await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterDropdown(typedFilterSelection.dropDown);
                                        await objpageFactory.ssdmPageFactory().applyFilter().clickOnFilterOption(typedFilterSelection.childDropDown);
                                        await objpageFactory.ssdmPageFactory().applyFilter().searchFilterOption(typedFilterSelection.option);
                                    }
                                );
                            }
                        }

                        await test.step("Apply filters and wait for KPI table to load", async () => {
                            await objpageFactory.ssdmPageFactory().applyFilter().clickOnApplyChanges();
                            await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
                        });

                        await test.step('Input number in all valid cell/non-empty cell', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().inputValueInAllValidInputCell("3333");
                        });

                        await test.step('Click on Calculate', async () => {
                            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton();
                            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy();
                            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForCalculationSuccessMessage();
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
                            await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
                        });

                        await test.step('Validate save is changed', async () => {
                            const changesList = await objpageFactory.ufmPageFactory().openCurrentForecast().getAllChanges();
                            expect(changesList).toContain(adjustmentName);
                        });
                    }
                );
            }
        }
    );
});