import { expect, Locator, Page } from "@playwright/test";

export class RemoveFunctionality {
    
    readonly page: Page;
    readonly viewDriver: Locator;
    readonly btnRemove: Locator;
    readonly driverVisibility: Locator;
 
    constructor(page: Page) {
        this.page = page;
        this.viewDriver = this.page.locator('//div[contains(@class,"chip-alignment")]//child::button[contains(@class,"drivers")]');
        this.btnRemove = this.page.locator("(//*[local-name()='svg' and @class='customClose'])[2]");
        this.driverVisibility = this.page.locator('//div[@col-id="nodeName"]//span[contains(text(),"${driverName}")]');
        
        
    }
    async clickOnViewDrivers(){
        await this.viewDriver.isVisible(); 
        await this.viewDriver.click();
           
    }

    async clickOnCrossButton(){
        await this.btnRemove.isVisible(); 
        await this.btnRemove.click();
    }

    async isDriverNotVisible(){
        await expect(this.driverVisibility).toBeHidden();

    }
}
