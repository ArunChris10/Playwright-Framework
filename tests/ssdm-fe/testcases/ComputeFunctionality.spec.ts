import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Compute Feature Test', { tag: "@Smoke @Regression @computeFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify compute is done successfully for user', { tag: "@computeFunctionality" }, async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedComputationSuccessfulMessage = testData.expectedComputationSuccessfulMessage;


        await test.step('Compute button is enabled for the User , if validation of file is successful', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
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


    test('Verify compute button remains disabled if validation is unsuccessful for user', { tag: "@computeFunctionality" }, async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.pathOfIncorrectFile);
        const nameOfTheMissingColumn = testData.missingColumns;

        await test.step('Compute button remains disabled for the User , if validation of file is unsuccessful', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath, nameOfTheMissingColumn);
            await objpageFactory.ssdmPageFactory().computeFile().verifyComputeButtonIsDisabled();

        });
    })

    test('Verify compute showing error message even if validation is successful for user', { tag: "@computeFunctionality" }, async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.computeFailingFile);
        const expectedComputationFailureMessage = testData.expectedComputationFailureMessage;

        await test.step('Computation button gets enabled for the User once validation of file is successful', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath);
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