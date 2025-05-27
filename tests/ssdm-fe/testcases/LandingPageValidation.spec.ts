import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { testData, filterOptions } from '../testdata/fileName.json';
import { Logger } from "../../common/fixtures/logger-utils";

test.describe('Landing page validate Feature Test', { tag: "@Smoke @Regression @walmart123" }, async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(TIMEOUT_SSDM_FE);
        await signinUtility.SignIn(page); // Centralized sign-in before each test
        objpageFactory = new PageFactory(page);
    });

    test('Verify Landing page is available with its tabular records', async () => {
        // Step: Verify the search field is displayed on the landing page
        await test.step('Verify the search field is displayed', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Search();
        });

        // Step: Validate the input records count and calculation count
        await test.step('Validate the input records count & calculation count is shown', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Count();
        });

        // Step: Check if sort by option is present on the landing page
        await test.step('Check sort by is present in landing page home', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().SortBy();
        });

        // Step: Check if group by option is present on the landing page
        await test.step('Check group by is present in landing page home', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().GroupBy();
        });

        // Step: Verify that the table settings button is displayed
        await test.step('Table settings button is shown', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Settings();
        });

        // Step: Ensure filter options are available for specific columns
        await test.step('Filter options is shown for columns except metric name & type', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Filter();
        });
    });

    test('Check if the search works with the complete metric name', async () => {
        // Use complete metric name for search
        const searchterm = testData.completeSearch;
        const result = await objpageFactory.ssdmPageFactory().landingPage().applyAndValidateSearch(searchterm, testData.dataFieldAttributeMetricName);
        if (result.count > 0) {
            for (const value of result.searchValues) {
                // Validate each value contains the search term
                expect(
                    value === searchterm || (value && value.includes(searchterm))
                ).toBeTruthy();
            }
        } else {
            Logger.log('No rows found for the complete metric name search term.');
        }
    });

    test('Check if the search works with the partial metric name', async () => {
        // Use partial metric name for search
        const searchterm = testData.partialSearch;
        const result = await objpageFactory.ssdmPageFactory().landingPage().applyAndValidateSearch(searchterm, testData.dataFieldAttributeMetricName);
        if (result.count > 0) {
            for (const value of result.searchValues) {
                // Validate each value contains the partial search term
                expect(value).toContain(searchterm);
            }
        } else {
            Logger.log('No rows found for the partial search term.');
        }
    });

    test('Check if the search response on incorrect metric name', async () => {
        // Use incorrect metric name for search
        const searchterm = testData.incorrectSearch;
        const result = await objpageFactory.ssdmPageFactory().landingPage().applyAndValidateSearch(searchterm, testData.dataFieldAttributeMetricName);
        if (result.count === 0) {
            // Assert that no results are returned for an incorrect search
            expect(result.count).toBe(0);
        } else {
            for (const value of result.searchValues) {
                // Validate none of the values contain the incorrect search term
                expect(value).not.toContain(searchterm);
            }
        }
    });

    // Validate filter functionality for the "month" column
    test('month column filter validation', async () => {
        let filterType = filterOptions[0].data.month.dropDown;
        let filterValue = filterOptions[0].data.month.actuals;
        await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(filterType, filterValue);
    });

    // Validate filter functionality for the "channel" column
    test('channel column filter validation', async () => {
        let filterType = filterOptions[0].data.channel.dropDown;
        let filterValue = filterOptions[0].data.channel.option;
        await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(filterType, filterValue);
    });

    // Validate filter functionality for the "department" column
    test('department column filter validation', async () => {
        let filterType = filterOptions[0].data.department.dropDown;
        let filterValue = filterOptions[0].data.department.option;
        await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(filterType, filterValue);
    });

    // Validate filter functionality for the "entity" column
    test('entity column filter validation', async () => {
        let filterType = filterOptions[0].data.entity.dropDown;
        let filterValue = filterOptions[0].data.entity.option;
        await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(filterType, filterValue);
    });

    // Validate filter functionality for the "owner" column
    test('owner column filter validation', async () => {
        let filterType = filterOptions[0].data.owner.dropDown;
        let filterValue = filterOptions[0].data.owner.option;
        await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(filterType, filterValue);
    });

    // Test the clear-all filter functionality
    test('User checks the Clear-all filter button functionality', async () => {
        // Apply a filter first
        const filterType = filterOptions[0].data.month.dropDown;
        const filterValue = filterOptions[0].data.month.actuals;
        await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(filterType, filterValue);

        // Clear all filters
        await objpageFactory.ssdmPageFactory().landingPage().clearAllFilterAndValidate(filterType, filterValue);
    });

    // Test the table settings functionality
    test('User checks the table settings', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().tableSettings();
    });

    // Test sorting functionality
    test('User sorts the data rows based on dropdown formats', async () => {
        // Sort data rows in ascending order
        await objpageFactory.ssdmPageFactory().landingPage().validateSortAZ();

        // Sort data rows in descending order
        await objpageFactory.ssdmPageFactory().landingPage().validateSortZA();

        // Sort data rows by recent updates
        await objpageFactory.ssdmPageFactory().landingPage().validateRecentlyUpdated();
    });

    // Test grouping functionality
    test('User groups the data rows based on dropdown formats', async () => {
        // Group data rows by node
        await objpageFactory.ssdmPageFactory().landingPage().validateGroupBySameNode();

        // Group data rows by owner
        await objpageFactory.ssdmPageFactory().landingPage().validateGroupByOwner();
    });
});