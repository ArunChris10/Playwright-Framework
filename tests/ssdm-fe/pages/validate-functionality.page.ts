import { expect, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class ValidateFunctionality {
    readonly page: Page;
    readonly btnValidate: Locator;
    readonly validationSuccessMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.btnValidate = page.getByText("Validate");
        this.validationSuccessMessage = page.locator("//span[contains(@class, 'module_content')]//child::span");
    }

    async clickOnValidateButton() {
        await this.btnValidate.click()


    }

    async verifyValidationIsSuccessful() {
        await Utility.waitForSpinnerToBeVisible(this.page);
        await Utility.waitForSpinnerToBeInvisible(this.page);
        const validate = await this.validationSuccessMessage.innerText();
        return validate;

    }

    async verifyIncorrectFileErrorMessageIsVisible(missingColumns: string[]) {
        await Utility.waitForSpinnerToBeVisible(this.page);
        await Utility.waitForSpinnerToBeInvisible(this.page);
        const missingColumnsString = `{${missingColumns.map(column => `'${column}'`).join(', ')}}`;
        await expect(this.page.getByText(`The following columns are missing in the uploaded node document: ${missingColumnsString}.`)).toBeVisible({
            timeout: 180000
        });
    }
}