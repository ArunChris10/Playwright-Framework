import { expect, Locator, Page } from "@playwright/test";

export class LockPublishFunctionality {

    readonly page: Page;
    readonly btnPublish: Locator;
    readonly btnConfirm: Locator;
    readonly publishStartedSuccessMesssage: Locator;
    readonly publishLockMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.btnPublish = this.page.locator('//button[text()="Publish"]');
        this.btnConfirm = this.page.locator('//button[text()="Confirm"]');
        this.publishStartedSuccessMesssage = this.page.getByText("Publish started successfully");
        this.publishLockMessage = this.page.getByText('Another publish is in progress. Please try again in a few minutes.');
    }
    async clickOnPublish() {
        await this.btnPublish.isVisible();
        await this.page.waitForTimeout(5000);
        await this.btnPublish.click();

    }

    async clickOnConfirmButton() {
        await this.btnConfirm.isVisible();
        await this.btnConfirm.click();

    }

    async visibilityOfPublishInitiatedMessage() {
        await expect(this.publishStartedSuccessMesssage).toBeVisible();
    }

    async visibilityOfPublishLockedMessage() {
        await expect(this.publishLockMessage).toBeVisible();
        await expect(this.publishStartedSuccessMesssage).toBeHidden();
    }
}