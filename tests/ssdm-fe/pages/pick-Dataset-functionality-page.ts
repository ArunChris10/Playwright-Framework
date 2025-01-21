import { expect, Locator, Page } from "@playwright/test";

export class PickDatasetFunctionality {

    readonly page: Page;
    readonly btnToggle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.btnToggle = this.page.locator('//span[contains(@class,"Switch-module_indicator")]');
    }
    async clickOnToggle() {
        await this.btnToggle.isVisible();
        await this.btnToggle.click();

    }

    async datasetInfoIsVisible(datasetInfo: string, datasetInfos: string) {
        await expect(this.page.getByText(`You are viewing the ${datasetInfo}. ${datasetInfos}`)).toBeVisible({
            timeout: 180000

        });
    }
}