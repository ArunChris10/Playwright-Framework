
import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../../ssdm-fe/fixtures/signinUtility";

test.describe('Validate Snapshot current version', { tag: "@Smoke @Regression @walmartNidhi" }, async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 300_000 });

    test.beforeEach(async ({ page }) => {
        await signinUtility.SignIn(page); // Centralized sign-in before each test
        objpageFactory = new PageFactory(page);
    });

    test('Verify User is able to download the snapshot', async () => {

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on Merch Ops Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation("Merchandising operations");
        })

        await test.step(`Click on Snapshot Forecast Button`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenForecastByName("Merch Ops Forecast");
        })

        await test.step('Download Single Snapshot', async () => {
            await objpageFactory.ufmPageFactory().snapshotsPage().selectSingleSnapshot();
            await objpageFactory.ufmPageFactory().snapshotsPage().clickDownloadButtonAndValidateModalText();
            
            
        });

        await test.step('Download multiple Snapshot', async () => {
            await objpageFactory.ufmPageFactory().snapshotsPage().selectAllSnapshots();
            await objpageFactory.ufmPageFactory().snapshotsPage().clickDownloadButtonAndValidateModalText();            
            
        });

    });

});