import path from "path";
import { expect, test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { TIMEOUT } from '../constants/timeout.json';
import { testData } from '../testdata/fileName.json';


test.describe('Verify Long Error Message is visible for Recompute Failure', { tag: "@Smoke @computeLongErrorMessage @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui @ibg-platform2-ui" }, async () => {
    let objpageFactory: PageFactory;
    const expectedFilePath = path.join(__dirname, testData.computeFailingFile);

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is able to see long error message by clicking on show more button and is able to close it by clicking on Ok button on recompute failure modal', { tag: "@longErrorMessage" }, async () => {
        test.setTimeout(TIMEOUT);

        await test.step('User picks dataset, validates the NE file and clicks on recompute button on succesful validation', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
            await objpageFactory.ssdmPageFactory().computeFile().visibilityOfComputeFailingMessageOnUnsuccessfulCompute();

        });

        await test.step('User should be able to see detailed error message by clicking on show more button on recompute failure error modal', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().clickOnShowMoreButton();
            const detailedLongComputeFailureMessage = await objpageFactory.ssdmPageFactory().computeFile().visibilityOfDetailedComputeFailureMessage();
            await expect(detailedLongComputeFailureMessage.length).toBeGreaterThan(100);
        });

        await test.step('User should be able to close long error message after reading message by clicking on Ok button on recompute failure', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().clickOnOkButton();
            await objpageFactory.ssdmPageFactory().computeFile().nonVisibilityOflongErrorModal();
        });

    });

    test('Verify User clicks on Close if do not want to see long detailed compute failure message', { tag: "@computeLongErrorMessage" }, async () => {
        test.setTimeout(TIMEOUT);
        await test.step('User picks dataset, validates NE file and clicks on recompute', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
            await objpageFactory.ssdmPageFactory().computeFile().visibilityOfComputeFailingMessageOnUnsuccessfulCompute();
        });

        await test.step('User should be able to close if do not want to see long detailed compute failure message', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().clickOnCloseButton();
            await objpageFactory.ssdmPageFactory().computeFile().nonVisibilityOflongErrorModal();
        });

    });
})