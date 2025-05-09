import { expect, Locator, Page } from "@playwright/test";
import { testData, filterOptions } from '../testdata/fileName.json';

export class LandingPageValidation {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly btnInput: Locator;
  readonly btnCalculations: Locator;
  readonly drpSortGroupBy: Locator;
  readonly btnSettings: Locator;
  readonly btnFilter: Locator;
  readonly searchFilter: Locator;
  readonly searchResult: Locator;
  readonly btnClearFilter: Locator;
  readonly checkbox: Locator;
  readonly sort_AZ: Locator;
  readonly sort_ZA: Locator;
  readonly recentUpdate: Locator;
  readonly btnClose: Locator;
  readonly sameNode: Locator;
  readonly owner: Locator;
  readonly text: Locator;
  readonly checked: Locator;
  readonly checktext: Locator | string;
  readonly monthText: Locator;
  readonly month1Text: Locator;
  readonly channelText: Locator;
  readonly channel1Text: Locator;
  readonly ownerText: Locator;
  readonly owner1Text: Locator;
  readonly departmentText: Locator;
  readonly department1Text: Locator;
  readonly entityText: Locator;
  readonly entity1Text: Locator;
  readonly sortGroup: Locator;
  readonly groupOwner: Locator;
  readonly groupOwner1: Locator;
  readonly groupOwner2: Locator;
  readonly nameText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('input[type="search"]');
    this.btnInput = page.locator('//button[text()="Inputs"]');
    this.btnCalculations = page.locator('//button[text()="Calculations"]');
    this.drpSortGroupBy = page.locator('//button[text()="Sort / Group by"]');
    this.btnSettings = page.locator('//button[aria-label="Gear"]');
    this.btnFilter = page.locator('//button[aria-label="Filter"]');
    this.searchFilter = page.locator('//input[contains(@class,"textfield")]');
    this.searchResult = page.locator('//i[contains(@class,"ld")]');
    this.btnClearFilter = page.locator('//button[text()="Clear Filter"]');
    this.checkbox = page.locator('input[type="checkbox"]');
    this.sort_AZ = page.locator('div[text()="Metric Name - A-Z"]');
    this.sort_ZA = page.locator('div[text()="Metric Name - Z-A"]');
    this.recentUpdate = page.locator('div[text()="Recently Updated"]');
    this.btnClose = page.locator('//button[text()="Close"]');
    this.sameNode = page.locator('div[text()="Same node variations"]');
    this.owner = page.locator('div[text()="Owner"]');
    this.text = page.locator('div[@role="gridcell"]');
    this.checked = page.locator('div[@role="row"]');
    this.checktext = page.locator('span[text()="Checkbox-module_labelText__14PgT"]');
    this.monthText = page.locator('div[data-field="month"]');
    this.nameText = page.locator('div[data-field="metricName"]');
    this.month1Text = page.locator('input[value="forecast"]');
    this.channelText = page.locator('input[value="DSV_S2H, DSV_S2S"]');
    this.channel1Text = page.locator('input[text()="DSV_S2H, DSV_S2S"]');
    this.ownerText = page.locator('input[value="MARKETPLACE"]');
    this.owner1Text = page.locator('input[text()="MARKETPLACE"]');
    this.departmentText = page.locator('input[value="*, 38_PHARMACY RX"]');
    this.department1Text = page.locator('input[text()="*, 38_PHARMACY RX"]');
    this.entityText = page.locator('input[value="ACQUISITIONS_AND_INCUBATIONS"]');
    this.entity1Text = page.locator('input[text()="ACQUISITIONS_AND_INCUBATIONS"]');
    this.sortGroup = page.locator('div[@role="rowgroup"]');
    this.groupOwner = page.locator('div[text()="SEGMENT"]');
    this.groupOwner1 = page.locator('div[text()="[11.04] Other Tax Expense - Pre-Opening"]');
    this.groupOwner2 = page.locator('div[text()="[11.05] Other Taxes non-regulated"]');
  }

  async Search() {
    await this.searchBox.isVisible();
  }

  async Count() {
    await this.btnInput.isVisible();
    await this.btnCalculations.isVisible();
  }

  async SortGroup() {
    await this.drpSortGroupBy.isVisible();
  }

  async Settings() {
    await this.btnSettings.isVisible();
  }
  async Filter() {
    await this.btnFilter.isVisible();
  }
  async completeSearch() {
    // await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(testData.completeSearch);
    await expect(this.text).toHaveText(testData.completeSearch);
  }
  async partialSearch() {
    await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(testData.partialSearch);
    await expect(this.text).toHaveText(testData.partialSearch)
  }
  async incorrectSearch() {
    await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(testData.incorrectSearch);
    await expect(this.text).not.toHaveText(testData.incorrectSearch);
  }
  async monthFilter() {
    await this.btnFilter.isVisible();
    await this.btnFilter.click();
    await expect(this.month1Text).toHaveValue(await this.monthText.inputValue());
  }
  async channelFilter() {
    await this.btnFilter.isVisible();
    await this.btnFilter.click();
    await expect(this.channel1Text).toHaveValue(await this.channelText.inputValue());
  }
  async ownerFilter() {
    await this.btnFilter.isVisible();
    await this.btnFilter.click();
    await expect(this.owner1Text).toHaveValue(await this.ownerText.inputValue());
  }
  async departmentFilter() {
    await this.btnFilter.isVisible();
    await this.btnFilter.click();
    await expect(this.department1Text).toHaveValue(await this.departmentText.inputValue());
  }
  async entityFilter() {
    await this.btnFilter.isVisible();
    await this.btnFilter.click();
    await expect(this.entity1Text).toHaveValue(await this.entityText.inputValue());
  }
  async clearAllFilter() {
    await this.btnClearFilter.isVisible();
    await this.btnClearFilter.click();
  }
  async tableSettings() {
    await this.checkbox.isVisible();
    await this.checkbox.click();
    if (typeof this.checktext !== 'string') {
      await expect(this.checked).toHaveText(await this.checktext.inputValue());
    }
    await this.btnClose.click();
  }

  async validateSortAZ() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.sort_AZ.isVisible();
    await this.sort_AZ.click();
    // Locate all rows in the column
    const columnData = await this.sortGroup[0].allTextContents();
    // Create a sorted copy of the column data
    const sortedData = [...columnData].sort((a, b) => a.localeCompare(b));
    // Validate that the original column data matches the sorted data
    await expect(columnData).toEqual(sortedData);
  }
  async validateSortZA() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.sort_ZA.isVisible();
    await this.sort_ZA.click();
    // Locate all rows in the column
    const columnData = await this.sortGroup[0].allTextContents();
    // Create a sorted copy of the column data in descending order
    const sortedData = [...columnData].sort((a, b) => b.localeCompare(a));
    // Validate that the original column data matches the sorted data
    expect(columnData).toEqual(sortedData);
  }
  async validateRecentlyUpdated() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.recentUpdate.isVisible();
    await this.recentUpdate.click();
    // Locate all rows in the "recently updated" column
    const columnData = await this.sortGroup[0].allTextContents();
    // Parse the column data into date objects
    const parsedDates = columnData.map((dateString: string | number | Date) => new Date(dateString));
    // Create a sorted copy of the parsed dates in descending order
    const sortedDates = [...parsedDates].sort((a, b) => b.getTime() - a.getTime());
    // Validate that the original parsed dates match the sorted dates
    expect(parsedDates).toEqual(sortedDates);
  }
  async validateGroupBySameNode() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.sameNode.isVisible();
    await this.sameNode.click();
    // await expect(this.nameText).toHaveText(testData.metricName1);
  }
  async validateGroupByOwner() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.owner.isVisible();
    await this.owner.click();
    const row1 = await expect(this.groupOwner).toHaveText(await this.groupOwner1.inputValue());
    const row2 = await expect(this.groupOwner).toHaveText(await this.groupOwner2.inputValue());
    expect(row1).not.toEqual(row2);
  }
}