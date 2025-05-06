import { Locator, Page, expect } from "@playwright/test";
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

    async selectComparisonCheckBox(groupByOption: string) {
        const groupBySelection = await this.page.getByLabel(groupByOption, { exact: true });
        await groupBySelection.check();
        await expect(groupBySelection).toBeChecked();
        await this.page.keyboard.press("Escape");
    }


}
