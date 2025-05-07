import path from "path";
import { expect, test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { TIMEOUT } from '../constants/timeout.json';
import { testData } from '../testdata/fileName.json';


test.describe('Verify Visibility Of Publish Button, Publish Progress tracker, Publish in progress message and Continuous Publish Status', { tag: "@Smoke @Regression @asyncPublishProcess" }, async () => {
    let objpageFactory: PageFactory;
    const expectedFilePath = path.join(__dirname, testData.computeSuccessFile);

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is able to see Publish Progress tracker, Publish in progress message and Continuous Publish Status', { tag: "@longErrorMessage" }, async () => {
        test.setTimeout(TIMEOUT);

        await test.step('User lands on my kpi page once review button is enabled', async () => {
            await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);

        });

        await test.step('user is able to view last published timestamp and owner on clicking tool tip on first visit to my kpi page', async () => {
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().clickOnToolTip();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().visibilityOftoolTipDetails();

        });

        await test.step('User is be able to see and click Publish button', async () => {
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().enterESCKey();
            await objpageFactory.ssdmPageFactory().lockPublish().clickOnPublish();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().clickOnConfirmButtonOnPublishModal();
            await objpageFactory.ssdmPageFactory().lockPublish().visibilityOfPublishInitiatedMessage();

        });

        await test.step('Publish button becomes invisible to user on triggering it instead progress bar and publish in progress message is visible', async () => {
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().isPublishButtonHidden();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().visibilityOfPublishProgressTracker();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().visibilityOfPublishInProgressMessage();

        });

        await test.step('User is able to see continuous publish status for ongoing publish by clicking on tool tip on My kpi page', async () => {
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().clickOnToolTip();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().visibilityOfContinuousPublishStatusOnClickingToolTip();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().enterESCKey();

        });

        await test.step('User can see the progress bar percentage for the publish process on my KPI page is the same as the NE grid', async () => {
            const pctOnKpiPage = await objpageFactory.ssdmPageFactory().asyncPublishProcess().verifyProgressPctOnMyKpi();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().navigatesBackToHomePage();
            await objpageFactory.ssdmPageFactory().newPublishedNE().refresheNEGrid();
            const pctNEGrid = await objpageFactory.ssdmPageFactory().asyncPublishProcess().verifyProgressPctOnNEGrid();
            expect(pctOnKpiPage).toBe(pctNEGrid);
        });

        await test.step('Publish button is enabled again on publish success or failure case in on Kpi page', async () => {
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().isPublishButtonVisible();
            
        });

        await test.step('Publish progress bar and tool tip is hidden on publish success or failure case in NE grid', async () => {
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().navigatesBackToHomePage();
            await objpageFactory.ssdmPageFactory().newPublishedNE().refresheNEGrid();
            await objpageFactory.ssdmPageFactory().asyncPublishProcess().isToolTipAndProgressBarHiddenInNEGrid();
           
            
        });
    });
});