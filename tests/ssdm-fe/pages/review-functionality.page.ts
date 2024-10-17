import { expect, Locator, Page } from "@playwright/test";

export class ReviewFunctionality {
    readonly page: Page;
    readonly btnReviewEnabled: Locator;
    readonly btnAddDrivers: Locator;
    readonly btnReviewDisabled: Locator;
   
    
    constructor(page: Page) {
        this.page = page;
        this.btnReviewEnabled = page.locator("//*[local-name()='svg'and @class='iconContainer reviewIcon']");
        this.btnAddDrivers = page.locator('//button[text()="Add Drivers"]'); 
        this.btnReviewDisabled = page.locator("//*[local-name()='svg'and @class='iconContainerDisabled reviewIcon']");

    }

    async isReviewButtonEnabled(){
       let isEnabledReviewButtonVisible= await this.btnReviewEnabled.isVisible(); 
       expect(isEnabledReviewButtonVisible).toBeTruthy(); 
        
    }

    async isReviewButtonClickable(){
        await this.btnReviewEnabled.click();
        await expect(this.btnAddDrivers).toBeVisible();

    }

    async isReviewButtonDisabled(){
        let isDisabledReviewButtonVisible = await this.btnReviewDisabled.isVisible();
        expect(isDisabledReviewButtonVisible).toBeTruthy();

    }

}