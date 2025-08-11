import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Upload Feature Test', { tag: "@Smoke @Regression @uploadFunctionality @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui @ibg-platform2-ui" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Check if the upload functionality is working fine with valid node edge file', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        const expectedFileNames = testData.expectedUploadedFileName;
        const expectedfileFormat = testData.fileFormat;

        await test.step('Click on Admins tab', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();

        })

        await test.step('Click on SSDM', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();

        });

        await test.step('Verify upload button is visible to the user', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().visibilityOfUploadButton();

        });

        await test.step('Upload valid node edge file on Upload button', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(expectedFilePath);

        });

        await test.step('Verify uploaded file format is in csv', async () => {
            const fileExtension = await objpageFactory.ssdmPageFactory().uploadFile().fileFormatIsInCsv();
            await expect(fileExtension).toBe(expectedfileFormat);
        });


        await test.step('Verify uploaded file name should be visible below the upload button', async () => {
            const fileNameUploaded = await objpageFactory.ssdmPageFactory().uploadFile().verifyUploadedFileName();
            await expect(fileNameUploaded).toBe(expectedFileNames);

        });

    });
});