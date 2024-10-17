import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Review Feature Test', { tag: "@reviewFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify review button is enabled and clickable', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedComputationSuccessfulMessage = testData.expectedComputationSuccessfulMessage;


        await test.step('User computes and validates the NE file', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
            await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
            await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();
 
        });

        await test.step('Verify review button is enabled and clickable, once compute is successful', async () => {
            const computeSuccessMessage = await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsSuccessful();
            await expect(computeSuccessMessage).toBe(expectedComputationSuccessfulMessage);
            await objpageFactory.ssdmPageFactory().review().isReviewButtonEnabled();
            await objpageFactory.ssdmPageFactory().review().isReviewButtonClickable();

        });

    })

    test('Verify review button remains disabled', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.computeFailingFile);

        await test.step('User computes and validates the NE file', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
            await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
            await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();

        });

        await test.step('Verify review button remains disabled if compute is unsuccessful', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsUnsuccessful();
            await objpageFactory.ssdmPageFactory().review().isReviewButtonDisabled();

        });

    })

})