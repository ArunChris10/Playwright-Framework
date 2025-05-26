
import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../../ssdm-fe/fixtures/signinUtility";

test.describe('Validate Snapshot current version', { tag: "@Smoke @Regression @snapshotsfe" }, async () => {
    let expectedSnapshotName: string   
    let objpageFactory: PageFactory;
    let totalNumberOfSnapshots: number = 0;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    })

    const snapshotTypes = ["Forecast", "OTB", "Budget"]; // Add the snapshot types you want to test

    snapshotTypes.forEach((snapshotType) => {
        test(`Verify User is able to snapshot current version of Scenarios as: ${snapshotType}`, async () => {
            await test.step(`Click on Merch Ops Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation("Merchandising operations");
            });

            await test.step(`get all snapshots total before creating any snapshot`, async () => {
                await objpageFactory.ufmPageFactory().snapshotsPage().selectAllSnapshots();
                totalNumberOfSnapshots = await objpageFactory.ufmPageFactory().snapshotsPage().getTotalNumberOfSnapshot();
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

            await test.step(`get all snapshots total after creating any snapshot`, async () => {
                await objpageFactory.ufmPageFactory().snapshotsPage().selectAllSnapshots();
                let totalNumberOfSnapshotsAfterCreation = await objpageFactory.ufmPageFactory().snapshotsPage().getTotalNumberOfSnapshot();
                expect(totalNumberOfSnapshotsAfterCreation).toBeGreaterThan(totalNumberOfSnapshots);
            });
        });
    });
    test('Verify User is able to download the snapshot', async () => {

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on Merch Ops Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation("Merchandising operations");
        })

        await test.step('Download Single Snapshot', async () => {
            await objpageFactory.ufmPageFactory().snapshotsPage().selectSingleSnapshot();
            await objpageFactory.ufmPageFactory().snapshotsPage().clickDownloadSnapshotButton();
            await objpageFactory.ufmPageFactory().snapshotsPage().downloadSnapshotAndValidateModalText();
         });

         await test.step('Download Single Snapshot with filters applied', async () => {
            await objpageFactory.ufmPageFactory().snapshotsPage().selectSingleSnapshot();
            await objpageFactory.ufmPageFactory().snapshotsPage().clickDownloadSnapshotButton();
            await objpageFactory.ufmPageFactory().snapshotsPage().selectDepartmentFromFilter();
            await objpageFactory.ufmPageFactory().snapshotsPage().selectChannelFromFilter();
            await objpageFactory.ufmPageFactory().snapshotsPage().downloadSnapshotAndValidateModalText();
         });

        await test.step('Download multiple Snapshot', async () => {
            await objpageFactory.ufmPageFactory().snapshotsPage().selectAllSnapshots();
            await objpageFactory.ufmPageFactory().snapshotsPage().clickDownloadSnapshotButton();
            await objpageFactory.ufmPageFactory().snapshotsPage().downloadSnapshotAndValidateModalText();

        });

    });

});