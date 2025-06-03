import { Locator, Page } from "@playwright/test";

export class AddDriverPage {



    readonly page: Page;
    readonly searchDriverField: string;
    readonly driverNodeTree: string;
    readonly searchIcon: Locator;
    readonly applyDrivers: Locator;
    readonly driverSearchResult: string;
    readonly driversModalHeader: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchDriverField = '//input[@placeholder="Search drivers"]'
        this.driverNodeTree = '//div[contains(@class,"driverTreeNode")]'
        this.searchIcon = page.locator("//button[@aria-label='icon']")
        this.applyDrivers = page.getByText('Apply Drivers')
        this.driverSearchResult = 'span[data-testid="remainingWord"]'
        this.driversModalHeader = this.page.locator('.modalTitle', { hasText: 'Add drivers' })

    }

    async waitForPageLoad() {
        await this.driversModalHeader.isVisible({ timeout: 1000 })
        await this.page.waitForSelector(this.driverNodeTree)
        return true
    }

    async waitForKPITableLoad() {
        await this.page.waitForSelector('[data-testid="forecast-table"]', { state: 'visible', timeout: 100000 });
        return true
    }

    async inputDriverName(driverName: string) {
        await this.page.locator(this.searchDriverField).fill(driverName).then(async () => {
            await this.page.waitForTimeout(1000)
            await this.page.keyboard.press('Enter')
        })
    }

    async selectDriver(driverName: string) {
        // await this.page.waitForSelector(this.driverSearchResult);
        await this.page.evaluate(() => {
            const elements = document.querySelectorAll('[data-testid="virtualTree"]');
            const lastElement = elements[elements.length - 1];
            lastElement.scrollIntoView();
        });
        await this.page.waitForSelector(`//div[@class="noncalculated"]//parent::*//parent::*//strong[contains(text(),"${driverName}")] `, { state: 'attached' });
        await this.page.waitForTimeout(2000);
        await this.page.getByRole('option', { name: `${driverName} input View in` }).getByLabel(`${driverName}`).check();
    }

    async searchAndApplyDrivers(driverNames: string[]) {
        for (const driverName of driverNames) {

            await this.waitForPageLoad();
            await this.inputDriverName(driverName);
            await this.selectDriver(driverName);


        } await this.clickOnApplyDrivers();
    }

    async clickOnApplyDrivers() {
        await this.applyDrivers.click()
    }
}