
import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../../ssdm-fe/fixtures/signinUtility";

test.describe('Validate Snapshot current version', { tag: "@Smoke @Regression @snapshotsfe" }, async () => {
    let objpageFactory: PageFactory;
    let expectedSnapshotName: string
    test.describe.configure({ mode: 'parallel', timeout: 300_000 });

    test.beforeEach(async ({ page }) => {
        await signinUtility.SignIn(page); // Centralized sign-in before each test
        objpageFactory = new PageFactory(page);
    });

    const snapshotTypes = ["Forecast","OTB","Budget"]; // Add the snapshot types you want to test

    snapshotTypes.forEach((snapshotType) => {
        test(`Verify User is able to snapshot current version of Scenarios as: ${snapshotType}`, async () => {
            await test.step(`Click on Merch Ops Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation("Merchandising operations");
            });
            await test.step(`Click on Snapshot Forecast Button`, async () => {
                await objpageFactory.ufmPageFactory().snapshotsPage().clickSnapshotsForecastButton();
                expectedSnapshotName = await objpageFactory.ufmPageFactory().snapshotsPage().getSnapshotNameInDialog();
            });
            await test.step(`Select ${snapshotType} Type Radio button`, async () => {
                await objpageFactory.ufmPageFactory().snapshotsPage().clickSnapshotType(snapshotType);
            });
            await test.step(`Click Snapshot only button`, async () => {
                await objpageFactory.ufmPageFactory().snapshotsPage().clickCreateSnapshotsOnlyButton();
            });
            await test.step(`Verify Snapshot Is Created`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().navigate();
                await objpageFactory.ufmPageFactory().snapshotsPage().verifySnapshotNameCreated(expectedSnapshotName);
                await objpageFactory.ufmPageFactory().snapshotsPage().verifySnapshotTimeStampCreated(snapshotType);
            });  
        });
    });

});