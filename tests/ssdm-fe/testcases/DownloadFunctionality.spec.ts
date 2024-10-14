import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';


test.describe('Download Feature Test', { tag: "@downloadFunctionality" }, async () => {
    let objpageFactory: PageFactory;
 
    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;

    })

    test('Check if the file is getting downloaded automatically for user', async () => {

        test.setTimeout(540000);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedValidationMessage = testData.expectedValidationMessage;

        await test.step('Verify file gets downloaded automatically, if validation of file is successful', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedFilePath);
            await objpageFactory.ssdmPageFactory().validateFile().fileGettingValidatedAndDownloaded();
            const validationMessage = await objpageFactory.ssdmPageFactory().validateFile().verifyValidationIsSuccessful();
            await expect(validationMessage).toBe(expectedValidationMessage);
            let isFileDownloaded = await objpageFactory.ssdmPageFactory().validateFile().verifyFileDownloaded();
            expect(isFileDownloaded).toBe(true);


        });
    });

    test('Check if the file is not getting downloaded automatically for user', async () => {

        const expectedPathOfIncorrectFile = path.join(__dirname, testData.pathOfIncorrectFile);
        const nameOfTheMissingColumn = testData.missingColumns;

        await test.step('Verify file does not get downloaded, if validation of file is not successful', async () => {

            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedPathOfIncorrectFile);
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
            await objpageFactory.ssdmPageFactory().validateFile().verifyIncorrectFileErrorMessageIsVisible(nameOfTheMissingColumn);
            let isFileNotDownloaded = await objpageFactory.ssdmPageFactory().validateFile().verifyFileNotDownloaded();
            expect(isFileNotDownloaded).toBe(true);

        });
    
    });
    
})