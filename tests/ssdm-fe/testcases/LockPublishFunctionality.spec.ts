import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';
import path from "path";


test.describe('Publish Lock Feature Test', { tag: "@lockPublishFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is not able to initiate publish if publish is already going on', { tag: "@lockPublishFunctionality" }, async () => {
        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);

        await test.step('User Navigates to SSDM home page', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();

        });

        await test.step('User navigates to my kpi page', async () => {
            await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);
        });

        await test.step('User clicks on Publish', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().clickOnPublish();

        });

        await test.step('User clicks on confirm button on publish modal', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().clickOnConfirmButton();

        });

        await test.step('User can see publish successful message', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().visibilityOfPublishInitiatedMessage();

        });

        await test.step('User again clicks on publish', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().clickOnPublish();

        });

        await test.step('User sees publish message and publish is not initiated', async () => {
            await objpageFactory.ssdmPageFactory().lockPublish().visibilityOfPublishLockedMessage();

        });

    })
})