import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/utility";
import { TIMEOUT } from '../constants/timeout.json';
import { filterOptions } from '../testdata/fileName.json';

test.describe('Landing page validate Feature Test', { tag: "@Smoke @Regression @walmart123" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        // Initialize the page factory before all tests
    });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page); // Centralized sign-in before each test
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

        await objpageFactory.ssdmPageFactory().landingPage().completeSearch(); // Perform search with complete metric name
    });

    test('Check if the search works with the partial metric name', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().partialSearch(); // Perform search with partial metric name
    });

    test('Check if the search response on incorrect metric name', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().incorrectSearch(); // Perform search with incorrect metric name
    });

    test('Check the filter validation functionality', async () => {

        // Validate filter functionality for the "month" column
        test.step('user selects the "month" column and  should be able to select filter values', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().monthFilter();
        });

        // Validate filter functionality for the "channel" column
        test.step('user selects the "channel" column and  should be able to select filter values', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().channelFilter();
        });

        // Validate filter functionality for the "owner" column
        test.step('user selects the "owner" column and  should be able to select filter values', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().ownerFilter();
        });

        // Validate filter functionality for the "department" column
        test.step('user selects the "department" column and  should be able to select filter values', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().departmentFilter();
        });

        // Validate filter functionality for the "entity" column
        test.step('user selects the "entity" column and  should be able to select filter values', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().entityFilter();
        });
    });
    //test the clear-all filter functionality
    filterOptions.forEach(filterOption => {
        test('User checks the Clear-all filter button functionality', async () => {
            for (const [, filterSelection] of Object.entries(filterOption.data)) {
                await test.step(`Select ${filterSelection["childDropDown"]} ${filterSelection["dropDown"]} ${filterSelection["option"]} filter options`, async () => {
                    await objpageFactory.ssdmPageFactory().applyFilter().clickOnFiltersButton();
                    await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterDropdown(filterSelection["dropDown"]);
                    await objpageFactory.ssdmPageFactory().applyFilter().clickOnFilterOption(filterSelection["childDropDown"]);
                    await objpageFactory.ssdmPageFactory().applyFilter().searchFilterOption(filterSelection["option"]);
                    await objpageFactory.ssdmPageFactory().landingPage().clearAllFilter();
                })
            }
        });
    })


    test('User checks the table settings', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().tableSettings(); // Validate table settings functionality
    });

    test('User sorts the data rows based on dropdown formats', async () => {

        // Sort data rows in ascending order
        await objpageFactory.ssdmPageFactory().landingPage().sortAZ();

        // Sort data rows in descending order
        await objpageFactory.ssdmPageFactory().landingPage().sortZA();

        // Sort data rows by recent updates
        await objpageFactory.ssdmPageFactory().landingPage().recentupdate();
    });

    test('User groups the data rows based on dropdown formats', async () => {

        // Group data rows by node
        await objpageFactory.ssdmPageFactory().landingPage().groupNode();

        // Group data rows by owner
        await objpageFactory.ssdmPageFactory().landingPage().groupOwner();
    });
});