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

   test('Login to SSDM using LabCredentials', async () => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(objpageFactory.page);
        //await objpageFactory.ssdmPageFactory().signInpage().signin();
        });
   
// test('Valiadate the elements present in the landing page', async()=>{
//     test.setTimeout(TIMEOUT);

//    await test.step('Verify the search field is displayed', async () => {
//          await objpageFactory.ssdmPageFactory().landingPage().Search();
//     });

//    await test.step('Validate the input records count & calculation count is shown', async()=>{
//         await objpageFactory.ssdmPageFactory().landingPage().Count();
//     });

//    await test.step('Check sort/group by is present in landing page home', async()=>{
//         await objpageFactory.ssdmPageFactory().landingPage().SortGroup();
//     })

//     await test.step('Table settings side bar is shown', async()=>{
//         await objpageFactory.ssdmPageFactory().landingPage().Settings();
//     })

//     await test.step('Filter options is shown for columns except metric name & type', async()=>{
//         await objpageFactory.ssdmPageFactory().landingPage().Filter();
//     })
// });
})