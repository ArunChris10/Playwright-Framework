import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Download Feature Test', { tag: "@downloadFunctionality" }, async () => {
    let objpageFactory: PageFactory;
 
    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();

    })

    test('Check if the file is getting downloaded automatically for user', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);

        await test.step('Verify file gets downloaded automatically, if validation of file is successful', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedFilePath,undefined,true);
            let isFileDownloaded = await objpageFactory.ssdmPageFactory().validateFile().verifyFileDownloaded();
            expect(isFileDownloaded).toBe(true);


        });
    });

    test('Check if the file is not getting downloaded automatically for user', async () => {

        const expectedPathOfIncorrectFile = path.join(__dirname, testData.pathOfIncorrectFile);
        const nameOfTheMissingColumn = testData.missingColumns;

        await test.step('Verify file does not get downloaded, if validation of file is not successful', async () => {
            await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(expectedPathOfIncorrectFile, nameOfTheMissingColumn);
            let isFileNotDownloaded = await objpageFactory.ssdmPageFactory().validateFile().verifyFileNotDownloaded();
            expect(isFileNotDownloaded).toBe(true);

        });
    
    });
    
})