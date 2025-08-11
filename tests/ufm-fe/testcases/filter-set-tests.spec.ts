import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";


test.describe('Validate FilterSet', { tag: "@Smoke @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {

    let objpageFactory: PageFactory;
    let filters = ["Channel", "Department"];
    let filterSetName = "Test Filter Set-Auto";
    let selectedFilters: string[] = [];
    let capturedFilters: string[] = [];
    let appliedFilters: string[] = [];
    let filterSets: string[] = [];
    test.describe.configure({ timeout: 1200_000, mode: "serial" })

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    })


    test(`Verify Save and Get filter set`, { tag: "@filterSetTests" }, async () => {

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation("Ecommerce");
        })

        await test.step('Select filters', async () => {
            for (const filterOption of filters) {
                const filtersReturned = await objpageFactory.ufmPageFactory().currentForecast().selectFilters(filterOption);
                selectedFilters = selectedFilters.concat(filtersReturned);
                console.log('Selected Filters:', selectedFilters);
            }
        })

        await test.step('Click on create new filter set', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnCreateNewFilterSetButton();
        })

        await test.step(`Fill input field with Filter set name`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().fillFilterSetName(filterSetName)
        })

        await test.step('Validate filter Set while creating has filters same as selected', async () => {
            capturedFilters = await objpageFactory.ufmPageFactory().currentForecast().captureUFMFilters();
            capturedFilters = capturedFilters.map(filter => filter.trim().toLowerCase().replace(/ /g, "").replace(/_/g, "")).sort();
            selectedFilters = selectedFilters.map(filter => filter.trim().toLowerCase().replace(/ /g, "").replace(/_/g, "")).sort();
            expect(capturedFilters).toEqual(selectedFilters);
        })

        await test.step('Click on Save Filter Set', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnSaveFilterSet()
        })

        await test.step('Click on FilterSet Dropdown', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
            filterSets = await objpageFactory.ufmPageFactory().currentForecast().getAvailableFilterSetsList()
        })
        await test.step(`Validate saved filter set is listed on the dropdown`, async () => {
            expect(filterSets.includes(filterSetName)).toBeTruthy()
        })

        await test.step('Click on reset filters', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnResetFilter();
        })
        await test.step('Click on Apply to choose the filterSet', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
            await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSet(filterSetName);
            await objpageFactory.ufmPageFactory().currentForecast().clickOnApplyFilterSet();
        })
        await test.step('Click on Apply Filter', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnApplyFilter();
        })
        await test.step('Validate filter set is applied', async () => {
            for (const filterOption of filters) {
                const filtersAppliedCurrently = await objpageFactory.ufmPageFactory().currentForecast().captureAppliedFilters(filterOption);
                appliedFilters = appliedFilters.concat(filtersAppliedCurrently);
            }
            appliedFilters = appliedFilters.map(filter => filter.trim().toLowerCase().replace(/ /g, "").replace(/_/g, "")).sort();
            expect(appliedFilters).toEqual(selectedFilters);
        })

        await test.step(`Delete existing filter set with name: ${filterSetName}`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetsDropdown();
            await objpageFactory.ufmPageFactory().currentForecast().deleteFilterSet(filterSetName);
            await objpageFactory.ufmPageFactory().currentForecast().getEmptyFilterSetListMessage();
        })

        await test.step(`Validate deleted filter set ${filterSetName} is removed from the dropdown on revisiting filterSet`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterSetButton();
            await objpageFactory.ufmPageFactory().currentForecast().getEmptyFilterSetListMessage()
        })

    })
})
