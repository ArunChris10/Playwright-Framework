import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { TIMEOUT } from '../constants/timeout.json';
import { testData, filterOptions } from '../testdata/fileName.json';

test.describe('Landing page validate Feature Test', { tag: "@Smoke @Regression @walmart123" }, async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 300_000 });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page); // Centralized sign-in before each test
        objpageFactory = new PageFactory(page);
    });

    test('Verify Landing page is available with its tabular records', async () => {

        // Verify the search field is displayed on the landing page
        await test.step('Verify the search field is displayed', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Search();
        });

        // Validate the input records count and calculation count
        await test.step('Validate the input records count & calculation count is shown', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Count();
        });

        // Check if sort/group by options are present on the landing page
        await test.step('Check sort/group by is present in landing page home', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().SortGroup();
        });

        // Verify that the table settings sidebar is displayed
        await test.step('Table settings side bar is shown', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Settings();
        });

        // Ensure filter options are available for specific columns
        await test.step('Filter options is shown for columns except metric name & type', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Filter();
        });
    });

    test('Check if the search works with the complete metric name', async () => {
        let searchterm = testData.completeSearch; // Perform search with complete metric name
        let result = await objpageFactory.ssdmPageFactory().landingPage().searchValidate(searchterm); 
        await expect (result).toHaveText(searchterm);
    });

    test('Check if the search works with the partial metric name', async () => {
        let searchterm = testData.partialSearch;  // Perform search with partial metric name
        let result = await objpageFactory.ssdmPageFactory().landingPage().searchValidate(searchterm); 
        await expect (result).toContainText(searchterm);
    });

    test('Check if the search response on incorrect metric name', async () => { 
        let searchterm = testData.incorrectSearch;  // Perform search with incorrect metric name
        let result = await objpageFactory.ssdmPageFactory().landingPage().searchValidate(searchterm); 
        await expect (result).not.toHaveText(searchterm);
    });

    // Validate filter functionality for the "month" column
    test('month column filter validation', async () => {
        let filterType = filterOptions[0].data.month.dropDown;
        let filterValue = filterOptions[0].data.month.actuals;
        await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(filterType, filterValue);
        await objpageFactory.ssdmPageFactory().landingPage().validateResultsByFilter(filterType, filterValue);
    });

    // Validate filter functionality for the "channel" column
    test('channel column filter validation', async () => {
        let filterType = filterOptions[0].data.channel.dropDown;
        let filterValue = filterOptions[0].data.channel.option;
        await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(filterType, filterValue);
        await objpageFactory.ssdmPageFactory().landingPage().validateResultsByFilter(filterType, filterValue);
    });

    // Validate filter functionality for the "department" column
    test('department column filter validation', async () => {
        let filterType = filterOptions[0].data.department.dropDown;
        let filterValue = filterOptions[0].data.department.option;
        await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(filterType, filterValue);
        await objpageFactory.ssdmPageFactory().landingPage().validateResultsByFilter(filterType, filterValue);    
    });

    // Validate filter functionality for the "entity" column
    test('entity column filter validation', async () => {
        let filterType = filterOptions[0].data.entity.dropDown;
        let filterValue = filterOptions[0].data.entity.option;
        await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(filterType, filterValue);
        await objpageFactory.ssdmPageFactory().landingPage().validateResultsByFilter(filterType, filterValue);
    });

    // Validate filter functionality for the "owner" column
    test('owner column filter validation', async () => {
        let filterType = filterOptions[0].data.owner.dropDown;
        let filterValue = filterOptions[0].data.owner.option;
        await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(filterType, filterValue);
        await objpageFactory.ssdmPageFactory().landingPage().validateResultsByFilter(filterType, filterValue);
    });

    //test the clear-all filter functionality
    test('User checks the Clear-all filter button functionality', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().clearAllFilter();
    });

    test('User checks the table settings', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().tableSettings(); // Validate table settings functionality
    });

    test('User sorts the data rows based on dropdown formats', async () => {

        // Sort data rows in ascending order
        await objpageFactory.ssdmPageFactory().landingPage().validateSortAZ();

        //     // Sort data rows in descending order
        await objpageFactory.ssdmPageFactory().landingPage().validateSortZA();

        //     // Sort data rows by recent updates
        await objpageFactory.ssdmPageFactory().landingPage().validateRecentlyUpdated();
    });

    test('User groups the data rows based on dropdown formats', async () => {

        // Group data rows by node
        await objpageFactory.ssdmPageFactory().landingPage().validateGroupBySameNode();

        // Group data rows by owner
        await objpageFactory.ssdmPageFactory().landingPage().validateGroupByOwner();
    });
});