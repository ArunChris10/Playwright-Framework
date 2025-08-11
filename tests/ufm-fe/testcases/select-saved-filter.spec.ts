import { testData } from '../testdata/filter.json';
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";


testData.forEach(filter => {
    test.describe('Select saved filter', { tag: "@Smoke @savedFilter @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {

        let payload = filter
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory, request }) => {
            objpageFactory = pageFactory;
            await UfmUtility.createFilter(payload.filter, request)
        })

        test(`Verify inputter can see response for the saved filter for ${filter.sbaName}`, { tag: "@savedFilter" }, async () => {

            test.setTimeout(500000);

            let filterSets: string[]
            interface forecastValues {
                totalValue: number,
                netSales: number
            }

            let forecastValueBeforeFilter: forecastValues
            let forecastValuesAfterFilter: forecastValues

            await test.step('Go To UFM Page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            })
            await test.step(`Click on ${payload.sbaName} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(payload.sbaName);
            })
            await test.step('Click on View in Absolute Numbers selection', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().waitForForecastToLoad()
                await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn("Absolute")
            })
            await test.step('Get forecast value before applying filter for comparison', async () => {
                forecastValueBeforeFilter = await objpageFactory.ufmPageFactory().currentForecast().getForecastValues()
            })
            await test.step('Click on FilterSet Dropdown', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
                filterSets = await objpageFactory.ufmPageFactory().currentForecast().getAvailableFilterSetsList()
            })
            await test.step(`Validate saved filter set ${payload.filter.filter_name} is listed on the dropdown`, async () => {
                expect(filterSets.includes(payload.filter.filter_name)).toBeTruthy()
            })
            await test.step(`Click on Saved Filterset ${payload.filter.filter_name}`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSet(payload.filter.filter_name);
            })
            await test.step('Click on Apply to choose the filterSet', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnApplyFilterSet();
            })
            await test.step('Click on Apply Filter', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnApplyFilter();
            })
            await test.step('Check if the filter is applied successfully by comparing with previous values', async () => {
                forecastValuesAfterFilter = await objpageFactory.ufmPageFactory().currentForecast().getForecastValues()

                expect(forecastValueBeforeFilter.totalValue).toBeGreaterThan(forecastValuesAfterFilter.totalValue)
                expect(forecastValueBeforeFilter.netSales).toBeGreaterThan(forecastValuesAfterFilter.netSales)
            })

        })



    })
})
