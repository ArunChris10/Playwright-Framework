import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';


test.describe('Compute Feature Test', { tag: "@computeFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    })

    test('Verify compute is done successfully for user', { tag: "@computeFunctionality" }, async () => {

        test.setTimeout(540000);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedValidationMessage = testData.expectedValidationMessage;
        const expectedComputationSuccessfulMessage = testData.expectedComputationSuccessfulMessage;


        await test.step('Compute button is enabled for the User , if validation of file is successful', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedFilePath);
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
            const validationMessage = await objpageFactory.ssdmPageFactory().validateFile().verifyValidationIsSuccessful();
            await expect(validationMessage).toBe(expectedValidationMessage);
            const computeButtonEnabled = await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
            await expect(computeButtonEnabled).toBeEnabled();

        });

        await test.step('User Clicks On Compute Button', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();    

        });

        await test.step('Verify Compute is Successful', async () => {
            const computeSuccessMessage = await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsSuccessful();
            await expect(computeSuccessMessage).toBe(expectedComputationSuccessfulMessage);

        });

    })

    test('Verify compute is not done successfully for user', { tag: "@computeFunctionality" }, async () => {

        test.setTimeout(540000);
        const expectedFilePath = path.join(__dirname, testData.pathOfIncorrectFile);
        const nameOfTheMissingColumn = testData.missingColumns;

        await test.step('Compute button remains disabled for the User , if validation of file is unsuccessful', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedFilePath);
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
            await objpageFactory.ssdmPageFactory().validateFile().verifyIncorrectFileErrorMessageIsVisible(nameOfTheMissingColumn);
            await objpageFactory.ssdmPageFactory().computeFile().verifyComputeButtonIsDisabled();

        });
    })

    test('Verify compute showing error message even if validation is successful for user', { tag: "@computeFunctionality" }, async () => {

        test.setTimeout(540000);
        const expectedFilePath = path.join(__dirname, testData.computeFailingFile);
        const expectedValidationMessage = testData.expectedValidationMessage;
        const expectedComputationFailureMessage = testData.expectedComputationFailureMessage;

        await test.step('Computation button is enabled for the User ,if validation of file is successful', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedFilePath);
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
            const validationMessage = await objpageFactory.ssdmPageFactory().validateFile().verifyValidationIsSuccessful();
            await expect(validationMessage).toBe(expectedValidationMessage);
            const computeButtonEnabled = await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
            await expect(computeButtonEnabled).toBeEnabled();
            

        });
        await test.step('User Clicks On Compute Button', async () => {
            await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();
 
        });

        await test.step('Verify compute failure message is visible to user', async () => {
            const computefailureMessage = await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsUnsuccessful();
            await expect(computefailureMessage).toBe(expectedComputationFailureMessage);

        });
    })

})