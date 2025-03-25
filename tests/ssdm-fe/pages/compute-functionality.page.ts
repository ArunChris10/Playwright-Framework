import { expect, Locator, Page } from "@playwright/test";

export class ComputeFunctionality {
    readonly page: Page;
    readonly btnCompute: Locator;
    readonly computeSuccessMessage: Locator;
    readonly computeFailureMessage: Locator;
    readonly computeSnackbarMessage: Locator;
    readonly btnClose: Locator;
    readonly computeMessageWindow: Locator;
    readonly longErrorSnackbar: Locator;
    readonly btnShowMore: Locator;
    readonly detailedLongComputeFailureMessage: Locator;
    readonly btnOk: Locator;


    constructor(page: Page) {
        this.page = page;
        this.btnCompute = page.locator('//button[text()="Recompute"]');
        this.computeSuccessMessage = page.getByText("Successfully computed scenario");
        this.computeFailureMessage = page.locator('//span[contains(@class,"contentContainer")]//child::span[contains(@class, "content")]');
        this.computeSnackbarMessage = page.getByText('Please wait, while it is computing..');
        this.longErrorSnackbar = page.locator('//div[contains(@class,"MuiSnackbar")]');
        this.btnShowMore = page.locator('//button[text()="show more"]');
        this.btnClose = page.locator('//button[text()="Close"]');
        this.detailedLongComputeFailureMessage = page.locator('//div[contains(@class,"contentInner")]');
        this.btnOk = page.locator('//button[text()="Ok"]');

    }

    async verifyComputeButtonIsEnabled() {
        await expect(this.btnCompute).toBeEnabled();

    }

    async clickOnComputeButton() {
        await this.btnCompute.click();
        await expect(this.computeSnackbarMessage).toBeVisible();
    }

    async verifyComputeIsSuccessful() {
        const compute = await this.computeSuccessMessage.innerText();
        return compute;

    }

    async verifyComputeButtonIsDisabled() {
        await expect(this.btnCompute).toBeDisabled();

    }

    async verifyComputeIsUnsuccessful() {
        await expect(this.computeFailureMessage).toBeVisible();
        const computefailureMessage = await this.computeFailureMessage.innerText();
        return computefailureMessage;
    }

    async longErrorSnackbarMessage() {
        await this.longErrorSnackbar.isVisible();

    }

    async clickOnShowMoreButton() {
        await this.btnShowMore.isVisible();
        await this.btnShowMore.click();
    }

    async clickOnCloseButton() {
        await this.btnClose.isVisible();
        await this.btnClose.click();
    }

    async visibilityOfDetailedComputeFailureMessage() {
        await this.detailedLongComputeFailureMessage.isVisible();
        const detailedLongComputeFailureMessage = await this.detailedLongComputeFailureMessage.innerText();
        return detailedLongComputeFailureMessage;
    }
    async clickOnOkButton() {
        await this.btnOk.isVisible();
        await this.btnOk.click();
    }

    async nonVisibilityOflongErrorModal() {
        await this.longErrorSnackbar.isHidden();

    }

    async visibilityOfComputeFailingMessageOnUnsuccessfulCompute() {
        await expect(this.btnCompute).toBeEnabled();
        await this.btnCompute.click();
        await expect(this.computeSnackbarMessage).toBeVisible();
        await expect(this.computeFailureMessage).toBeVisible();
        await this.computeFailureMessage.innerText();
        await this.longErrorSnackbar.isVisible();
    }

}