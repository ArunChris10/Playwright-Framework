import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';

test.describe('Validate Feature Test', { tag: "@validateFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    })

    test('Check if the validate functionality is working fine', async () => {

        test.setTimeout(600000);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedValidationMessage = testData.expectedValidationMessage;

        await test.step('Upload the node edge file', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedFilePath);
        });

        await test.step('Click on Validate button', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
        });

        await test.step('Verify User sees the validation successful message', async () => {
            const validationMessage = await objpageFactory.ssdmPageFactory().validateFile().verifyValidationIsSuccessful();
            await expect(validationMessage).toBe(expectedValidationMessage);

        });
    })


    test('Check if error message is visible when data is found missing in file validation', async () => {

        test.setTimeout(540000);
        const expectedPathOfIncorrectFile = path.join(__dirname, testData.pathOfIncorrectFile);
        const nameOfTheMissingColumn = testData.missingColumns;

        await test.step('Upload the node edge file', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedPathOfIncorrectFile);
        })

        await test.step('Click on Validate button', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
        })

        await test.step('Verify User should see error message', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyIncorrectFileErrorMessageIsVisible(nameOfTheMissingColumn);

        })

    });
});