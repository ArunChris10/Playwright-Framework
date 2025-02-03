import { expect, test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';
import path from "path";


test.describe('Visibility Of Newly Published NE feature Test', { tag: "@Smoke @Regression @newlyPublishedNEVisibilityFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is able to see newly published NE', { tag: "@lockPublishFunctionality" }, async () => {
        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedFilename = testData.expectedUploadedFileName;
        const expectedNewlyPublishedDocStatus = testData.newlyPublishedNodeEdgeStatus;

        await test.step('User Navigates to my Kpi page', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);

        });

        await test.step('User clicks on publish button', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().clickOnPublish();
            await objpageFactory.ssdmPageFactory().lockPublish().clickOnConfirmButton();

        });

        await test.step('Once publish is successful, User navigates back to SSDM home page and refreshes the NE grid', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().visibilityOfPublishInitiatedMessage();
            await objpageFactory.ssdmPageFactory().newPublishedNE().navigateBackToSSDMHomePage();
            await objpageFactory.ssdmPageFactory().newPublishedNE().refresheNEGrid();

        });

        await test.step('In NE grid, user can see the newly published NE in the first row with its status as in progress', async () => {
            const publishedDocumentName = await objpageFactory.ssdmPageFactory().newPublishedNE().visibilityOfNewlyPublishedDocName();
            expect(publishedDocumentName).toBe(expectedFilename);
            const newlyPublishedDocumentStatus = await objpageFactory.ssdmPageFactory().newPublishedNE().visibilityOfNewlyPublishedNEStatus();
            expect(newlyPublishedDocumentStatus).toBe(expectedNewlyPublishedDocStatus);
            await objpageFactory.ssdmPageFactory().newPublishedNE().visibilityOfNewlyPublishedDocDateAndTime(testData.dateTimePattern);

        });
    })
})