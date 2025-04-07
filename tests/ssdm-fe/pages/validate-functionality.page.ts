import { expect, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import { PageFactory } from "../../common/pages/page-factory";
import { testData } from '../testdata/fileName.json';

export class ValidateFunctionality {
    readonly page: Page;
    readonly btnValidate: Locator;
    readonly validationSuccessMessage: Locator;
    readonly alert: Locator;
    readonly btnClose: Locator;

    constructor(page: Page) {
        this.page = page;
        this.btnValidate = page.locator('//button[text()="Validate"]');
        this.validationSuccessMessage = page.getByText("Validation successful");
        this.alert = page.locator(' //div[contains(@class,"Alert-module_error")]');
        this.btnClose = page.locator('//button[text()="Close"]');

    }

    async fileGettingValidatedAndDownloaded() {
        await this.btnValidate.click();
        this.page.on('download', async download => {
            return await Utility.downloadAndSaveValidatedExcelFile(download);

        })
    }

    async clickOnValidateButton() {
        await this.btnValidate.click();
    }

    async verifyFileNotDownloaded() {
        const isFileNotDownloaded = await Utility.fileNotGettingDownloaded();
        return isFileNotDownloaded;

    }

    async verifyFileDownloaded() {
        const isFileDownloaded = await Utility.fileGettingDownloaded();
        return isFileDownloaded;

    }


    async verifyValidationIsSuccessful() {
        const validate = await this.validationSuccessMessage.innerText();
        await this.btnClose.click();
        return validate;

    }


    async verifyIncorrectFileErrorMessageIsVisible(missingColumns: string[]) {
        const missingColumnsString = `{${missingColumns.map(column => `'${column}'`).join(', ')}}`;
        await expect(this.page.getByText(`The following columns are missing in the uploaded node document: ${missingColumnsString}.`)).toBeVisible({
            timeout: 180000
        });
    }

    async verifyValidation(filepath: string, nameOfTheMissingColumn?: string[], fileShouldBeDownloaded?: boolean) {
        let objpageFactory = new PageFactory(this.page);

        await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
        await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();

        // Click on the toggle to pick the dataset
        await objpageFactory.ssdmPageFactory().pickDataset().clickOnToggle();
        await objpageFactory.ssdmPageFactory().uploadFile().selectFileToBeUploaded(filepath);

        if (fileShouldBeDownloaded) {
            await objpageFactory.ssdmPageFactory().validateFile().fileGettingValidatedAndDownloaded();
        } else {
            await objpageFactory.ssdmPageFactory().validateFile().clickOnValidateButton();
        }

        if (nameOfTheMissingColumn) {
            await objpageFactory.ssdmPageFactory().validateFile().verifyIncorrectFileErrorMessageIsVisible(nameOfTheMissingColumn);
        } else {
            const validationMessage = await objpageFactory.ssdmPageFactory().validateFile().verifyValidationIsSuccessful();
            await expect(validationMessage).toBe(testData.expectedValidationMessage);
        }
    }
}