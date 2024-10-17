import { Locator, Page } from "@playwright/test";

export class AddDriverPage {
    
    

    readonly page: Page;
    readonly searchDriverField: string;
    readonly driverNodeTree: string;
    readonly searchIcon: Locator;
    readonly applyDrivers: Locator;
    readonly driverSearchResult: string;

    constructor(page: Page) {
        this.page = page;
        this.searchDriverField = '//input[@placeholder="Search drivers"]'
        this.driverNodeTree = '//div[@class="driverTreeNode"]'
        this.searchIcon = page.locator("//button[@aria-label='icon']")
        this.applyDrivers = page.getByText('Apply Drivers')
        this.driverSearchResult = 'span[data-testid="remainingWord"]'
    }

    async waitForPageLoad() {
        await this.page.waitForSelector(this.driverNodeTree)
    }

    async inputDriverName(driverName: string) {
        await this.page.locator(this.searchDriverField).fill(driverName).then(async () => {
            await this.page.waitForTimeout(1000)
            await this.page.keyboard.press('Enter')
        })
    }

    async selectDriver(driverName: string) {
        await this.page.waitForSelector(this.driverSearchResult);
        await this.page.evaluate(() => {
            const elements = document.querySelectorAll('[data-testid="virtualTree"]');
            const lastElement = elements[elements.length - 1];
            lastElement.scrollIntoView();
        });
        await this.page.waitForSelector(`label:has(span[data-testid="remainingWord"]):has-text("${driverName}")`, {state: 'attached'});
        await this.page.waitForTimeout(5000);
        const driverNodeElement = await this.page.$(`label:has(span[data-testid="remainingWord"]):has-text("${driverName}")`);
        await driverNodeElement.click();
        await this.page.locator(`//div[@class="customSelected"]//span[contains(text(),"${driverName}")]`).waitFor({ state: "visible" })
    }

    async clickOnApplyDrivers() {
        await this.applyDrivers.click()
    }

}