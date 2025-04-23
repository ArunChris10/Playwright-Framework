import { Locator, Page } from "@playwright/test";

export class AddDriverPage {



    readonly page: Page;
    readonly searchDriverField: string;
    readonly driverNodeTree: string;
    readonly searchIcon: Locator;
    readonly applyDrivers: Locator;
    readonly driverSearchResult: string;
    readonly inputDriverTab: Locator
    readonly driverCheckBoxes: Locator
    readonly checkBox: String

    constructor(page: Page) {
        this.page = page;
        this.searchDriverField = '//input[@placeholder="Search drivers"]'
        this.checkBox = '//div[@data-testid="customCheckbox"]//input'
        this.driverNodeTree = '//div[@class="driverTreeNode"]'
        this.searchIcon = page.locator("//button[@aria-label='icon']")
        this.applyDrivers = page.getByText('Apply Drivers')
        this.driverSearchResult = 'span[data-testid="remainingWord"]'
        this.inputDriverTab = page.getByText("Inputs only")
        this.driverCheckBoxes = page.locator('//div[@class="layoutContentDriverComponent sharedPages"]//input')
    }

    async waitForPageLoad() {
        await this.page.waitForSelector(this.driverNodeTree)
    }

    async selectAllInputDrivers() {

        while (true) {
            const checkboxes = await this.page.$$('//div[@data-testid="customCheckbox"]//input');
            let allChecked = true;

            for (let i = 0; i < checkboxes.length; i++) {
                // Re-query the checkbox inside the loop to avoid stale handles
                const checkbox = (await this.page.$$('//div[@data-testid="customCheckbox"]//input'))[i];
                if (checkbox) {
                    const isChecked = await checkbox.isChecked();
                    if (!isChecked) {
                        await checkbox.scrollIntoViewIfNeeded(); // ensures it's in view
                        await this.page.waitForTimeout(50)
                        await checkbox.click({ force: true }); // force click in case of overlay
                        allChecked = false;
                    }
                }
            }

            if (allChecked) break;
        }

    }
    async toggleToInputDriversTab() {
        await this.inputDriverTab.click()
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
        await this.page.waitForSelector(`label:has(span[data-testid="remainingWord"]):has-text("${driverName}")`, { state: 'attached' });
        await this.page.waitForTimeout(5000);
        const driverNodeElement = await this.page.$(`label:has(span[data-testid="remainingWord"]):has-text("${driverName}")`);
        await driverNodeElement.click();
        await this.page.locator(`//div[@class="customSelected"]//span[contains(text(),"${driverName}")]`).waitFor({ state: "visible" })
    }

    async clickOnApplyDrivers() {
        await this.applyDrivers.click()
    }

}