import { testData, groupByOptions, filterOptions } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";


testData.forEach(forecastNodeDetail => {

    test.describe('Calculate and Save when node is at at lowest grain', { tag: "@Smoke @calculateAndSaveLowestGrainInputNode" }, async () => {
        let data = forecastNodeDetail
        let objpageFactory: PageFactory;
        let adjustmentName;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test('Verify inputter can calculate and save changes when node is at at lowest grain', { tag: "@calculateLowestGrainInputNode" }, async () => {
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


            await test.step(`Search for input driver: ${data.driver.inputDriver}`, async () => {
                await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(data.driver.inputNonAdditiveDrivers)

            })

            await test.step("Wait for KPI table to load", async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad()
            })

            await test.step("Select group by to select grains of nodes selected to see its lowest dimension", async () => {
                for (const groupByOption of groupByOptions) {
                    for (const [, groupBySelection] of Object.entries(groupByOption.data)) {
                        await test.step(`Select ${groupBySelection["option"]} group By Options`, async () => {
                            await objpageFactory.ssdmPageFactory().applyFilter().clickOnGroupBy();
                            await objpageFactory.ssdmPageFactory().applyFilter().selectGroupByOption(groupBySelection["option"]);

                        })
                    }
                }
            })

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
                adjustmentName = "Change 1"
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