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
  readonly owners: Locator;
  readonly checked: Locator;
  readonly monthText: Locator;
  readonly channelText: Locator;
  readonly ownerText: Locator;
  readonly departmentText: Locator;
  readonly entityText: Locator;
  readonly sortGroup: Locator;
  readonly nameText: Locator;
  readonly textField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('input[type="search"]');
    this.btnInput = page.locator('//button[text()="Inputs"]');
    this.btnCalculations = page.locator('//button[text()="Calculations"]');
    this.drpSortGroupBy = page.locator('//p[text()="Sort / Group by"]');
    this.btnSettings = page.locator('//div[@data-field="settings"]');
    this.btnFilter = page.locator('//button[@aria-label="Filter"]');
    this.searchFilter = page.locator('//input[contains(@class,"textfield")]');
    this.searchResult = page.locator('//i[contains(@class,"ld")]');
    this.btnClearFilter = page.locator('//button[@type="button"]');
    this.checkbox = page.locator('input[type="checkbox"]');
    this.sort_AZ = page.locator('//div[text()="Metric Name - A-Z"]');
    this.sort_ZA = page.locator('//div[text()="Metric Name - Z-A"]');
    this.recentUpdate = page.locator('//div[text()="Recently Updated"]');
    this.btnClose = page.locator('//button[text()="Close"]');
    this.sameNode = page.locator('//div[text()="Same node variations"]');
    this.owner = page.locator('div[data-field="owner"]');
    this.owners = page.locator('//div[text()="Owner"]')
    this.checked = page.locator('//div[@role="row"]');
    this.monthText = page.locator('//div[@data-field="month"]');
    this.nameText = page.locator('div[data-field="metricName"]');
    this.textField = page.locator('//input[@type="text"]');
    this.channelText = page.locator('//div[@data-field="channel"]');
    this.ownerText = page.locator('//div[@data-field="owner"]');
    this.departmentText = page.locator('//div[@data-field="department"]');
    this.entityText = page.locator('//div[@data-field="entity"]');
    this.sortGroup = page.locator('//div[@role="gridcell"]');
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
    await this.btnFilter.nth(0).isVisible();
  }
  async completeSearch() {
    await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(testData.completeSearch);
    await expect(this.nameText.nth(1)).toHaveText(testData.completeSearch);
  }
  async partialSearch() {
    await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(testData.partialSearch);
    await expect(this.nameText.nth(2)).toContainText(testData.partialSearch)
  }
  async incorrectSearch() {
    await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(testData.incorrectSearch);
    await expect(this.nameText.nth(1)).not.toHaveText(testData.incorrectSearch);
  }
  async monthFilter() {
    await this.btnFilter.nth(0).isVisible();
    await this.btnFilter.nth(0).click();
    await this.textField.fill(filterOptions[0].data.month.actuals)
    await this.btnFilter.nth(0).click({ force: true });
    await expect(this.monthText.nth(1)).toHaveText(filterOptions[0].data.month.actuals);
  }
  async channelFilter() {
    await this.btnFilter.nth(1).isVisible();
    await this.btnFilter.nth(1).click();
    await this.textField.fill(filterOptions[0].data.channel.options)
    await this.btnFilter.nth(0).click({ force: true });
    await expect(this.channelText.nth(1)).toHaveText(filterOptions[0].data.channel.options);
  }
  async ownerFilter() {
    await this.btnFilter.nth(4).isVisible();
    await this.btnFilter.nth(4).click();
    await this.textField.fill(filterOptions[0].data.owner.segment)
    await this.btnFilter.nth(0).click({ force: true });
    await expect(this.ownerText.nth(1)).toHaveText(filterOptions[0].data.owner.segment);
  }
  async departmentFilter() {
    await this.btnFilter.nth(2).isVisible();
    await this.btnFilter.nth(2).click();
    await this.textField.fill(filterOptions[0].data.department.options)
    await this.btnFilter.nth(0).click({ force: true });
    await expect(this.departmentText.nth(1)).toHaveText(filterOptions[0].data.department.options);
  }
  async entityFilter() {
    await this.btnFilter.nth(3).isVisible();
    await this.btnFilter.nth(3).click();
    await this.textField.fill(filterOptions[0].data.entity.option)
    await this.btnFilter.nth(0).click({ force: true });
    await expect(this.entityText.nth(1)).toHaveText(filterOptions[0].data.entity.option);
  }
  async clearAllFilter() {
    await this.btnClearFilter.nth(2).isVisible();
    await this.btnClearFilter.nth(2).click();
    await expect(this.channelText.nth(1)).not.toHaveText(filterOptions[0].data.channel.options);
  }
  async tableSettings() {
    await this.btnSettings.isVisible();
    await this.btnSettings.nth(0).click();
    await this.checkbox.nth(2).click();
    await expect(this.checked.nth(2)).not.toHaveText(testData.month);
    await this.btnClose.click();
  }

  async validateSortAZ() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.sort_AZ.isVisible();
    await this.sort_AZ.click();
    await this.page.waitForTimeout(1000);
    // Locate all rows in the column
    const columnData = await this.sortGroup.nth(0).allTextContents();
    // Create a sorted copy of the column data
    const sortedData = [...columnData].sort((a, b) => a.localeCompare(b));
    // Validate that the original column data matches the sorted data
    expect(columnData).toEqual(sortedData);
  }
  async validateSortZA() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click();
    await this.sort_ZA.isVisible();
    await this.sort_ZA.click();
    await this.page.waitForTimeout(1000);
    // Locate all rows in the column
    const columnData = await this.sortGroup.nth(0).allTextContents();
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
    await this.page.waitForTimeout(1000);
    // Locate all rows in the column
    const columnData = await this.sortGroup.nth(0).allTextContents();
    // Parse the column data into date objects
    const parsedDates = columnData.map((dateString: string | number | Date) => new Date(dateString));
    // Create a sorted copy of the parsed dates in descending order
    const sortedDates = [...parsedDates].sort((a, b) => b.getTime() - a.getTime());
    // Validate that the original parsed dates match the sorted dates
    expect(parsedDates).toEqual(sortedDates);
  }
  async validateGroupBySameNode() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click(); // clicks on the sort/groupby button
    await this.sameNode.isVisible();
    await this.sameNode.click({ force: true }); //clicks on the dropdown values to group by same node variations
    await expect(this.sortGroup.nth(0)).toHaveText(testData.metricNames); //assert
  }
  async validateGroupByOwner() {
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click(); // clicks on the sort/groupby button
    await this.owners.isVisible();
    await this.owners.click({ force: true });//clicks on the dropdown values to group by owner
    expect(await this.owner.nth(1).textContent()).toBe(await this.owner.nth(2).textContent())
    expect(await this.nameText.nth(1).textContent()).not.toBe(await this.nameText.nth(2).textContent()); //assert
  }
}