import { filterOptions } from '../testdata/filter.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";


filterOptions.forEach(filterOption => {
    test.describe('Save and Delete Filter', { tag: "@Smoke @SaveAndDeleteFilter @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {
        test.describe.configure({ timeout: 300_000, mode: "serial" });
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test("Verify inputter can save a filter set", { tag: "@saveFilter" }, async () => {
            let filterSets: string[]
            test.setTimeout(500000);

            await test.step('Go To UFM Page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            })

            await test.step(`Click on ${filterOption.sbaName} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(filterOption.sbaName);
            })

            await test.step('Click on View in Absolute Numbers selection', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().waitForForecastToLoad()
                await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn('Absolute')
            })

            for (const [, filterSelection] of Object.entries(filterOption.data)) {
                await test.step(`Select ${filterSelection["option"]} ${filterSelection["dropDown"]} filter`, async () => {
                    await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterDropdown(filterSelection["dropDown"]);
                    await objpageFactory.ufmPageFactory().currentForecast().selectFilterOption(filterSelection["option"]);
                })
            }

            await test.step('Click on FilterSet Dropdown', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
            })

            await test.step('Click on create new filter set', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnCreateNewFilterSet()
            })

            for (const [, filterSelection] of Object.entries(filterOption.data)) {
                let filterDataCountTemplate = `${filterSelection.dropDown.toUpperCase()} (1): ${filterSelection.option.toUpperCase()}`.replace(/_/g, " ");
                await test.step(`Validate Selected filters are listed in the create new filterset page as ${filterDataCountTemplate}`, async () => {
                    const selectedUFMFilters = await objpageFactory.ufmPageFactory().currentForecast().getUFMSelectedFilters()
                    await expect(selectedUFMFilters).toContain(filterDataCountTemplate);
                })
            }

            await test.step(`Fill input field with Filter set name: ${filterOption.filterSetName}`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().fillFilterSetName(filterOption.filterSetName)
            })

            await test.step('Click on Save Filter Set', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnSaveFilterSet()
            })

            await test.step(`Validate saved filter set ${filterOption.filterSetName} is listed on the dropdown`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
                filterSets = await objpageFactory.ufmPageFactory().currentForecast().getAvailableFilterSetsList()
                expect(filterSets.includes(filterOption.filterSetName)).toBeTruthy()
            })
        })

        test("Verify inputter can delete an existing filter set", { tag: "@deleteFilter" }, async () => {
            let filterSets: string[]
            await test.step('Click on FilterSet Dropdown', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
            })

            await test.step(`Delete existing filter set with name: ${filterOption.filterSetName}`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().deleteFilterSet(filterOption.filterSetName)
            })

            await test.step(`Validate deleted filter set ${filterOption.filterSetName} is removed from the dropdown`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().waitForFiltersetListToBeVisible();
                filterSets = await objpageFactory.ufmPageFactory().currentForecast().getAvailableFilterSetsList()
                expect(filterSets.includes(filterOption.filterSetName)).toBeFalsy()
            })
        })
    })
})