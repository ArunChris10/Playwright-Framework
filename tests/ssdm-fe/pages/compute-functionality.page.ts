import { expect, Locator, Page } from "@playwright/test";

export class ComputeFunctionality {
    readonly page: Page;
    readonly btnCompute: Locator;
    readonly computeSuccessMessage: Locator;
    readonly computeFailureMessage: Locator;
    readonly computeSnackbarMessage: Locator;
    readonly btnClose:Locator;
    readonly computeMessageWindow:Locator;

    
    constructor(page: Page) {
        this.page = page;
        this.btnCompute = page.locator('//button[text()="Recompute"]');
        this.computeSuccessMessage = page.getByText("Recompute successful");
        this.computeFailureMessage = page.locator('//span[contains(@class,"Alert-module_contentContainer")]//child::span[contains(@class,"Alert-module_content")]');
        this.computeSnackbarMessage = page.getByText('Please wait, while it is computing..');

    }

    async isComputeButtonEnabled(){
        const computeButton = this.btnCompute
        return computeButton;
        
    }

    async clickOnComputeButton(){
        await this.btnCompute.click();
        await expect(this.computeSnackbarMessage).toBeVisible();
    }

    async verifyComputeIsSuccessful() {
        const compute = await this.computeSuccessMessage.innerText();
        return compute;

    }

    async verifyComputeButtonIsDisabled(){
        await expect(this.btnCompute).toBeDisabled();

    }

    async verifyComputeIsUnsuccessful(){
        await expect(this.computeFailureMessage).toBeVisible();
        const computefailureMessage = await this.computeFailureMessage.innerText();
        return computefailureMessage;
    }

}