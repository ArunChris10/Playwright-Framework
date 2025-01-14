import { expect, Locator, Page } from "@playwright/test";

export class FilterFunctionality {

    readonly page: Page;
    readonly viewDriver: Locator;
    readonly btnFilter: Locator;
    readonly btnGroupBy: Locator;
    readonly channelName: Locator;
    readonly btnApplyChanges: Locator;
    readonly departmentName: Locator;
    readonly searchBar: Locator;
    readonly searchResult: Locator;


    constructor(page: Page) {
        this.page = page;
        this.viewDriver = this.page.locator('//div[contains(@class,"chip-alignment")]//child::button[contains(@class,"drivers")]');
        this.btnFilter = this.page.locator('//button[text()="Filters"]');
        this.btnGroupBy = this.page.locator('//button[text()="Group-By"]');
        this.btnApplyChanges = this.page.locator('//button[text()="Apply changes"]');
        this.channelName = this.page.locator("//div[@role='gridcell' and @col-id='channel']");
        this.departmentName = this.page.locator("//div[@role='gridcell' and @col-id='department']");
        this.searchBar = this.page.locator('//input[contains(@class,"textfield")]');
        this.searchResult = this.page.locator('//i[contains(@class,"ld")]');
    }

    async clickOnFiltersButton() {
        await this.btnFilter.isVisible();
        await this.btnFilter.click();

    }
    async clickOnApplyChanges() {
        await this.btnApplyChanges.isVisible();
        await this.btnApplyChanges.click();


    }
    async clickOnGroupBy() {
        await this.btnGroupBy.click();
    }

    async selectGroupByOption(groupByOption: string) {
        const groupBySelection = await this.page.getByLabel(groupByOption, { exact: true });
        await groupBySelection.check();
        await expect(groupBySelection).toBeChecked();
        await this.page.keyboard.press("Escape");
    }

    async visibilityOfChannel() {
        const channelNames = await this.channelName.innerText();
        return channelNames;

    }

    async visibilityOfDepartment() {
        const departmentNames = await this.departmentName.innerText();
        return departmentNames;

    }
    async searchFilterOption(optionValue: string) {
        await this.searchBar.isVisible();
        await this.searchBar.click();
        await this.searchBar.fill(optionValue)
        await this.page.waitForTimeout(1000);
        await this.searchResult.isVisible();
        await this.page
            .getByLabel(`${optionValue}`, { exact: true })
            .check();
        await this.page.keyboard.press("Escape");
        await this.btnFilter.click();

    }

    async clickOnFilterOption(filterName: string) {
        await this.page
            .getByText(`${filterName}`)
            .first()
            .check();
    }
}