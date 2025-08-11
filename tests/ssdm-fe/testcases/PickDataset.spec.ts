import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Pick Dataset Feature Test', { tag: "@Smoke @Regression @pickDatasetFunctionality @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui @ibg-platform2-ui" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is able to pick dataset On SSDM home page', { tag: "@pickDatasetFunctionality" }, async () => {
        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const latestDatasetInfo = testData.latestDatasetInfo;

        await test.step('User validates the NE file', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
            const computeButtonEnabled = await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
            await expect(computeButtonEnabled).toBeEnabled();

        });

        await test.step('User selects dataset of choice and computes NE with that dataset', async () => {
            await objpageFactory.ssdmPageFactory().pickDataset().clickOnToggle();
            await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();
            await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsSuccessful();
            await objpageFactory.ssdmPageFactory().review().isReviewButtonEnabled();
            await objpageFactory.ssdmPageFactory().review().isReviewButtonClickable();

        });

        await test.step('Verify as per dataset selection, datset is reflected on my kpi page', async () => {
            await objpageFactory.ssdmPageFactory().pickDataset().datasetInfoIsVisible(latestDatasetInfo, testData.latestDatasetMessage);


        });

    })

    test('Verify by default dataset is activated if user do not pick latest dataset On SSDM home page', async () => {
        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const activatedDatasetInfo = testData.activatedDatasetInfo;

        await test.step('User validates the NE file', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
            const computeButtonEnabled = await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
            await expect(computeButtonEnabled).toBeEnabled();

        });

        await test.step('User do not dataset of choice and computes NE', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();
            await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsSuccessful();
            await objpageFactory.ssdmPageFactory().review().isReviewButtonEnabled();
            await objpageFactory.ssdmPageFactory().review().isReviewButtonClickable();

        });

        await test.step('Verify as per dataset selection, datset is reflected on my kpi page', async () => {
            await objpageFactory.ssdmPageFactory().pickDataset().datasetInfoIsVisible(activatedDatasetInfo, testData.activatedDatasetMessage);

        });

    })
})