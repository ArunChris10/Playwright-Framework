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
  readonly filterResult: Locator;
  readonly getFilterButtonXPath: any;


  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('input[type="search"]');
    this.btnInput = page.locator('//button[text()="Inputs"]');
    this.btnCalculations = page.locator('//button[text()="Calculations"]');
    this.drpSortGroupBy = page.locator('//p[text()="Sort / Group by"]');
    this.btnSettings = page.locator('//div[@data-field="settings"]');
    //this.btnFilter = page.locator('//button[@aria-label="Filter"]');
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
    this.nameText = page.locator('//div[@data-field="metricName"]');
    this.textField = page.locator('//input[@type="text"]');
    this.channelText = page.locator('//div[@data-field="channel"]');
    this.ownerText = page.locator('//div[@data-field="owner"]');
    this.departmentText = page.locator('//div[@data-field="department"]');
    this.entityText = page.locator('//div[@data-field="entity"]');
    this.sortGroup = page.locator('//div[@role="gridcell"]');
    this.getFilterButtonXPath = (label: string): string => `//div[span[contains(., "${label}")] and button[@aria-label="Filter"]]/button`;

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

  async searchValidate(searchterm: string) {
    await this.searchBox.isVisible();
    await this.searchBox.click();
    await this.searchBox.fill(searchterm);
    return this.nameText.nth(1);
  }

  // async monthFilter() {
  //   await this.btnFilter.nth(0).isVisible();
  //   await this.btnFilter.nth(0).click();
  //   await this.textField.fill(filterOptions[0].data.month.actuals)
  //   await this.btnFilter.nth(0).click({ force: true });
  //   await expect(this.monthText.nth(1)).toHaveText(filterOptions[0].data.month.actuals);
  // }
  // async channelFilter() {
  //   await this.btnFilter.nth(1).isVisible();
  //   await this.btnFilter.nth(1).click();
  //   await this.textField.fill(filterOptions[0].data.channel.options)
  //   await this.btnFilter.nth(0).click({ force: true });
  //   await expect(this.channelText.nth(1)).toHaveText(filterOptions[0].data.channel.options);
  // }
  // async ownerFilter() {
  //   await this.btnFilter.nth(4).isVisible();
  //   await this.btnFilter.nth(4).click();
  //   await this.textField.fill(filterOptions[0].data.owner.segment)
  //   await this.btnFilter.nth(0).click({ force: true });
  //   await expect(this.ownerText.nth(1)).toHaveText(filterOptions[0].data.owner.segment);
  // }
  // async departmentFilter() {
  //   await this.btnFilter.nth(2).isVisible();
  //   await this.btnFilter.nth(2).click();
  //   await this.textField.fill(filterOptions[0].data.department.options)
  //   await this.btnFilter.nth(0).click({ force: true });
  //   await expect(this.departmentText.nth(1)).toHaveText(filterOptions[0].data.department.options);
  // }
  // async entityFilter() {
  //   await this.btnFilter.nth(3).isVisible();
  //   await this.btnFilter.nth(3).click();
  //   await this.textField.fill(filterOptions[0].data.entity.option)
  //   await this.btnFilter.nth(0).click({ force: true });
  //   await expect(this.entityText.nth(1)).toHaveText(filterOptions[0].data.entity.option);
  // }

  async selectFilter(filterType: string) {
    let i = 0;
    let b = filterOptions[0].data.month.actuals;
    let c: Locator = this.monthText.nth(1); // Default assignment to avoid uninitialized usage
    switch (filterType) {
      case "month":
        i = 0;
        b = filterOptions[0].data.month.actuals;
        c = this.monthText.nth(1);
        break;
      case "channel":
        i = 1;
        b = filterOptions[0].data.channel.optionValue;
        c = this.channelText.nth(1);
        break;
      case "department":
        i = 2;
        b = filterOptions[0].data.department.options;
        c = this.departmentText.nth(1);
        break;
      case "entity":
        i = 3;
        b = filterOptions[0].data.entity.option;
        c = this.entityText.nth(1);
        break;
      case "owner":
        i = 4;
        b = filterOptions[0].data.owner.segment;
        c = this.ownerText.nth(1);
        break;
    }
    await this.btnFilter.nth(i).isVisible();
    await this.btnFilter.nth(i).click();
    await this.textField.fill(b);
    await this.btnFilter.nth(0).click({ force: true, timeout: 100000 });
    expect(await c.textContent()).toBe(b);
  }

  async clearAllFilter() {
    let i = 2;
    let c = this.channelText.nth(1);
    let b = filterOptions[0].data.channel.optionValue;

    await this.btnFilter.nth(i).isVisible();
    await this.btnFilter.nth(i).click();
    await this.textField.fill(b)
    await this.btnFilter.nth(0).click({ force: true }); //applies filter
    await this.btnClearFilter.nth(i).isVisible();
    await this.btnClearFilter.nth(i).click(); //clears filter
    await expect(c).not.toHaveText(b);
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
    let a = 1; let b = 2;
    await this.drpSortGroupBy.isVisible();
    await this.drpSortGroupBy.click(); // clicks on the sort/groupby button
    await this.owners.isVisible();
    await this.owners.click({ force: true });//clicks on the dropdown values to group by owner
    expect(await this.owner.nth(a).textContent()).toBe(await this.owner.nth(b).textContent())
    expect(await this.nameText.nth(a).textContent()).not.toBe(await this.nameText.nth(b).textContent()); //assert
  }

  async selectAndApplyFilter(filterType: string, filterValue: string)
  {
    const filterButton = this.page.locator(this.getFilterButtonXPath(filterType));
    await filterButton.isVisible();
    await filterButton.click();
    await this.textField.fill(filterValue);
    await this.page.locator('body').click({ position: { x: 0, y: 0 }, force: true, timeout: 100000 });
  }

  async validateResultsByFilter(filterType: string, filterValueExpected:string)
  {
    const dataFieldAttribute = filterType.toLowerCase();
    const resultElements = await this.page.$$(`[data-field="${dataFieldAttribute}}"]`);
    for (const element of resultElements)
    {
      const filterValue = await element.textContent();
      expect(filterValue).toBe(filterValueExpected);
    }
  }
}