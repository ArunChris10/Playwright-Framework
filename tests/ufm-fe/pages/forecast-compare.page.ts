import { Locator, Page } from "@playwright/test";
export class ForecastComparisonPageFactory {
    readonly page: Page;
    readonly compareButton: Locator


    constructor(page: Page) {
        this.page = page;
        this.compareButton = page.getByText("Compare")

    }

    async clickOnCompare() {
        await this.compareButton.click();
    }


}
