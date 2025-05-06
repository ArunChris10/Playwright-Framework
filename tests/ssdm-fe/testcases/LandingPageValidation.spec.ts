import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/utility";
import { TIMEOUT } from '../constants/timeout.json';

test.describe('Landing page validate Feature Test', { tag: "@Smoke @Regression @walmart123" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        //await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify Landing page is available with its tabular records', async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);

        // await page.pause()
        // await objpageFactory.ssdmPageFactory().signInpage().signin();
        await test.step('Verify the search field is displayed', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Search();
        });

        await test.step('Validate the input records count & calculation count is shown', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Count();
        });

        await test.step('Check sort/group by is present in landing page home', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().SortGroup();
        })

        await test.step('Table settings side bar is shown', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Settings();
        })

        await test.step('Filter options is shown for columns except metric name & type', async () => {
            await objpageFactory.ssdmPageFactory().landingPage().Filter();
        })
    });

    test('Check if the search works with the complete metric name', async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        await objpageFactory.ssdmPageFactory().landingPage().completeSearch();

    })
    test('Check if the search works with the partial metric name', async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        await objpageFactory.ssdmPageFactory().landingPage().partialSearch();

    })
    test('Check if the search response on incorrect metric name', async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        await objpageFactory.ssdmPageFactory().landingPage().incorrectSearch();
    })

    test('Check the filter validation functionality', async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        test.step('user selects the "month" column and  should be able to select filter values', async () => {

            await objpageFactory.ssdmPageFactory().landingPage().monthFilter();
        })
        test.step('user selects the "channel" column and  should be able to select filter values', async () => {

            await objpageFactory.ssdmPageFactory().landingPage().channelFilter();
        })
        test.step('user selects the "owner" column and  should be able to select filter values', async () => {

            await objpageFactory.ssdmPageFactory().landingPage().ownerFilter();
        })
        test.step('user selects the "department" column and  should be able to select filter values', async () => {

            await objpageFactory.ssdmPageFactory().landingPage().departmentFilter();
        })
        test.step('user selects the "entity" column and  should be able to select filter values', async () => {

            await objpageFactory.ssdmPageFactory().landingPage().entityFilter();
        })

    })
    test('User checks the Clear-all filter button functionality', async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        // await objpageFactory.ssdmPageFactory().landingPage().clearAllFilter(["option"]);
    });
    test('User checks the table settings', async({page}) =>{
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        await objpageFactory.ssdmPageFactory().landingPage().tableSettings();
    });

    test('User sorts the data rows based on dropdown formats', async({page})=>{
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        await objpageFactory.ssdmPageFactory().landingPage().sortAZ();
        await objpageFactory.ssdmPageFactory().landingPage().sortZA();
        await objpageFactory.ssdmPageFactory().landingPage().recentupdate();
    })

    test('User groups the data rows based on dropdown formats', async({page})=>{
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page);
        await objpageFactory.ssdmPageFactory().landingPage().groupNode();
        await objpageFactory.ssdmPageFactory().landingPage().groupOwner();
    })
});