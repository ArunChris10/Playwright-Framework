import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData, filterOptions, groupByOptions } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';

filterOptions.forEach(filterOption => {

    test.describe('Filter Functionality Test', { tag: "@Smoke @Regression @applyFilterFunctionality" }, async () => {
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })

        test('Verify User is able to apply filter', async () => {

            test.setTimeout(TIMEOUT);
            const expectedFilePath = path.join(__dirname, testData.filePath);

            await test.step('User can see selected driver on my kpi table', async () => {
                await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);
                await objpageFactory.ssdmPageFactory().drivers().selectAndViewDriver(testData.inputDriverFirst, testData.inputDriverSecond);

            });


            for (const [, filterSelection] of Object.entries(filterOption.data)) {
                await test.step(`Select ${filterSelection["childDropDown"]} ${filterSelection["dropDown"]} ${filterSelection["option"]} filter options`, async () => {
                    await objpageFactory.ssdmPageFactory().applyFilter().clickOnFiltersButton();
                    await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterDropdown(filterSelection["dropDown"]);
                    await objpageFactory.ssdmPageFactory().applyFilter().clickOnFilterOption(filterSelection["childDropDown"]);
                    await objpageFactory.ssdmPageFactory().applyFilter().searchFilterOption(filterSelection["option"]);

                })

            }

            for (const groupByOption of groupByOptions) {
                for (const [, groupBySelection] of Object.entries(groupByOption.data)) {
                    await test.step(`Select ${groupBySelection["option"]} group By Options`, async () => {
                        await objpageFactory.ssdmPageFactory().applyFilter().clickOnGroupBy();
                        await objpageFactory.ssdmPageFactory().applyFilter().selectGroupByOption(groupBySelection["option"]);

                    })
                }
            }

            await test.step('User clicks on apply changes', async () => {
                await objpageFactory.ssdmPageFactory().applyFilter().clickOnApplyChanges();

            });

            await test.step('User should be able to see corresponding result for applied filter on my Kpi table', async () => {
                await objpageFactory.ssdmPageFactory().removeDrivers().clickOnViewDrivers();
                await objpageFactory.ssdmPageFactory().removeDrivers().clickOnCrossButton();
                await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers();
                const actualChannelName = await objpageFactory.ssdmPageFactory().applyFilter().visibilityOfChannel();
                await expect(actualChannelName).toBe(filterOption.data.channel.option);
                const actualDepartmentName = await objpageFactory.ssdmPageFactory().applyFilter().visibilityOfDepartment();
                await expect(actualDepartmentName).toBe(filterOption.data.department.option);

            });

        });
    });
});