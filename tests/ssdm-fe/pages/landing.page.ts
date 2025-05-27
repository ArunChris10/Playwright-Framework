import { expect, Locator, Page } from "@playwright/test";
import { testData } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Logger } from "../../common/fixtures/logger-utils";

export class LandingPageValidation {

  readonly page: Page;
  readonly searchBox: Locator;
  readonly btnInput: Locator;
  readonly btnCalculations: Locator;
  readonly dropdownSortBy: Locator;
  readonly dropdownGroupBy: Locator;
  readonly btnSettings: Locator;
  readonly btnFilter: Locator;
  readonly btnClearFilter: Locator;
  readonly checkbox: Locator;
  readonly sort_AZ: Locator;
  readonly sort_ZA: Locator;
  readonly recentUpdate: Locator;
  readonly btnClose: Locator;
  readonly sameNode: Locator;
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
  readonly dataGridTable: string;
  readonly tooltipValue: Locator;
  readonly getFilterButtonXPath: (label: string) => string;
  readonly getGridValueXPath: (dataFieldAttribute: string) => string;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('input[type="search"]');
    this.btnInput = page.getByRole('button', { name: "Inputs" });
    this.btnCalculations = page.getByRole('button', { name: "Calculations" });
    this.dropdownSortBy = page.getByText("Sort by");
    this.dropdownGroupBy = page.getByText("Group by");
    this.btnSettings = page.locator('button[aria-label="Gear"]');
    this.btnFilter = page.locator('button[aria-label="Filter"]');
    this.btnClearFilter = page.getByText("Reset");
    this.checkbox = page.locator('input[type="checkbox"]');
    this.sort_AZ = page.getByText("Metric Name - A-Z");
    this.sort_ZA = page.getByText("Metric Name - Z-A");
    this.recentUpdate = page.getByText("Recently Updated");
    this.btnClose = page.getByRole('button', { name: "Close" });
    this.sameNode = page.getByText("Same node variations");
    this.owners = page.locator('//div[contains(@class, "sort-group-menu flex-row")]/div[normalize-space(text())="Owner/Editor"]');
    this.checked = page.locator('[role="row"]');
    this.monthText = page.locator('[data-field="month"]');
    this.nameText = page.locator('[data-field="metricName"]');
    this.textField = page.locator('input[type="text"]');
    this.channelText = page.locator('[data-field="channel"]');
    this.ownerText = page.locator('[data-field="owner"]');
    this.departmentText = page.locator('[data-field="department"]');
    this.entityText = page.locator('[data-field="entity"]');
    this.sortGroup = page.locator('[role="gridcell"]');
    this.dataGridTable = ".data-grid-table";
    this.tooltipValue = page.locator('//div[@role="tooltip"]/div/span').first();
    this.getFilterButtonXPath = (label: string) => `//div[span[contains(., "${label}")] and button[@aria-label="Filter"]]/button`;
    this.getGridValueXPath = (dataFieldAttribute: string) => `[data-field="${dataFieldAttribute}"][role="gridcell"]`;
  }

  // Waits for the search box to be visible
  async Search() {
    await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  // Waits for input and calculation buttons to be visible
  async Count() {
    await this.btnInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.btnCalculations.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  // Waits for the sort by dropdown to be visible
  async SortBy() {
    await this.dropdownSortBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  // Waits for the group by dropdown to be visible
  async GroupBy() {
    await this.dropdownGroupBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  // Waits for the settings button to be visible
  async Settings() {
    await this.btnSettings.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  // Waits for the first filter button to be visible
  async Filter() {
    await this.btnFilter.first().waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Applies a search term and returns the count and values of matching results.
   * @param searchterm The term to search for.
   * @param dataFieldAttribute The data-field attribute to validate.
   */
  async applyAndValidateSearch(searchterm: string, dataFieldAttribute: string) {
    await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.searchBox.click();
    await this.searchBox.fill(searchterm);
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    
    const resultElements = await this.page.$$(this.getGridValueXPath(dataFieldAttribute));
    const searchValues: (string | null)[] = [];
    for (const element of resultElements) {
      const searchValue = await element.textContent();
      searchValues.push(searchValue?.trim() ?? null);
    }
    return { count: resultElements.length, searchValues };
  }

  /**
   * Clears all filters by clicking the reset button and validates that no filters are applied.
   */
  async clearAllFilterAndValidate(filterType: string, filterValue: string) {
    await this.btnClearFilter.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.btnClearFilter.click();
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });

    const result = await this.validateResultsByFilter(filterType);
    if (result.count > 0) {
      const allContain = result.filterValues.every(value => value?.includes(filterValue));
      expect(allContain).toBeFalsy();
    } else {
      expect(result.count).toBe(0);
    }
  }

  /**
   * Opens table settings and toggles a column.
   */
  async tableSettings() {
    await this.btnSettings.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.btnSettings.click();
    await this.checkbox.nth(2).click();
    await expect(this.checked.nth(2)).not.toHaveText(testData.month);
    await this.btnClose.click();
  }

  /**
   * Validates that the column is sorted A-Z (ascending order), case-insensitive.
   */
  async validateSortAZ() {
    await this.dropdownSortBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownSortBy.click();
    await this.sort_AZ.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.sort_AZ.click();
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const columnData = await this.sortGroup.allTextContents();
    // Case-insensitive comparison for ascending order
    const isAscending = columnData.every(
      (val, i, arr) =>
        i === 0 || arr[i - 1].toLowerCase().localeCompare(val.toLowerCase()) <= 0
    );
    expect(isAscending).toBeTruthy();
  }

  /**
   * Validates that the column is sorted Z-A (descending order), case-insensitive.
   */
  async validateSortZA() {
    await this.dropdownSortBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownSortBy.click();
    await this.sort_ZA.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.sort_ZA.click();
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const columnData = await this.sortGroup.allTextContents();
    // Case-insensitive comparison for descending order
    const isDescending = columnData.every(
      (val, i, arr) =>
        i === 0 || arr[i - 1].toLowerCase().localeCompare(val.toLowerCase()) >= 0
    );
    expect(isDescending).toBeTruthy();
  }

  /**
   * Validates that the column is sorted by recently updated.
   */
  async validateRecentlyUpdated() {
    await this.dropdownSortBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownSortBy.click();
    await this.recentUpdate.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.recentUpdate.click();
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const columnData = await this.sortGroup.allTextContents();
    const parsedDates = columnData.map(dateString => new Date(dateString));
    const sortedDates = [...parsedDates].sort((a, b) => b.getTime() - a.getTime());
    expect(parsedDates).toEqual(sortedDates);
  }

  /**
   * Validates grouping by same node.
   * Checks that each group has all rows with the same value.
   */
  async validateGroupBySameNode() {
    await this.dropdownGroupBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownGroupBy.click();
    await this.sameNode.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.sameNode.click({ force: true });
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });

    //Scroll to bottom to load all groups if table is virtualized
    await this.page.evaluate(() => {
      const grid = document.querySelector('.data-grid-table');
      if (grid) grid.scrollTop = grid.scrollHeight;
    });
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);

    // Get all values in the grouped column using getGridValueXPath
    const metricNameCells = await this.page.$$(this.getGridValueXPath('metricName'));
    const groupedValues: string[] = [];
    for (const cell of metricNameCells) {
      const text = await cell.textContent();
      if (text !== null) groupedValues.push(text.trim());
    }

    // Group by value and count occurrences
    const groupMap = new Map<string, number>();
    for (const val of groupedValues) {
      groupMap.set(val, (groupMap.get(val) ?? 0) + 1);
    }

    // Validate each group has consistent values
    let groupIndex = 1;
    for (const [value, count] of groupMap.entries()) {
      //console.log(`Group ${groupIndex} has ${count} rows with value "${value}"`);
      const rowsInGroup = groupedValues.filter(v => v === value);
      expect(rowsInGroup.length).toBe(count);
      expect(rowsInGroup.every(v => v === value)).toBeTruthy();
      groupIndex++;
    }

    // Assert that there is at least one group
    expect(groupMap.size).toBeGreaterThan(0);
  }

  /**
   * Validates grouping by owner.
   * Checks that each group has all rows with the same owner.
   */
  async validateGroupByOwner() {
    await this.dropdownGroupBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownGroupBy.click();
    await this.owners.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.owners.click({ force: true });
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });

    // Scroll to bottom to load all groups if table is virtualized
    await this.page.evaluate(() => {
      const grid = document.querySelector('.data-grid-table');
      if (grid) grid.scrollTop = grid.scrollHeight;
    });
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);

    // Get all values in the grouped column using getGridValueXPath for 'owner'
    const ownerCells = await this.page.$$(this.getGridValueXPath('owner'));
    const ownerValues: string[] = [];
    for (const cell of ownerCells) {
      const text = await cell.textContent();
      if (text !== null) ownerValues.push(text.trim());
    }

    // Group by owner value and count occurrences
    const groupMap = new Map<string, number>();
    for (const val of ownerValues) {
      groupMap.set(val, (groupMap.get(val) ?? 0) + 1);
    }

    // Validate each group has consistent values
    let groupIndex = 1;
    for (const [value, count] of groupMap.entries()) {
      //console.log(`Group ${groupIndex} has ${count} rows with owner "${value}"`);
      const rowsInGroup = ownerValues.filter(v => v === value);
      expect(rowsInGroup.length).toBe(count);
      expect(rowsInGroup.every(v => v === value)).toBeTruthy();
      groupIndex++;
    }

    // Assert that there is at least one group
    expect(groupMap.size).toBeGreaterThan(0);
  }

  /**
   * Selects and applies a filter for a given column.
   * @param filterType The column to filter.
   * @param filterValue The value to filter by.
   */
  async selectAndApplyFilter(filterType: string, filterValue: string) {
    const filterButton = this.page.locator(this.getFilterButtonXPath(filterType));
    await filterButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await filterButton.click();
    await this.textField.fill(filterValue);
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);
    await this.page.locator('body').click({ position: { x: 0, y: 0 }, force: true, timeout: TIMEOUT_FE_WAIT });
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Validates the results after applying a filter.
   * If a cell has a tooltip, checks the tooltip text for the filter value as well.
   * @param filterType The column filtered.
   * @returns Object with count and array of filter values.
   */
  async validateResultsByFilter(filterType: string) {
    const dataFieldAttribute = filterType.toLowerCase();
    const resultElements = await this.page.$$(this.getGridValueXPath(dataFieldAttribute));
    const filterValues: (string | null)[] = [];

    for (const element of resultElements) {
      // Try to get the visible text
      let filterValue = (await element.textContent())?.trim() ?? null;

      // Check for tooltip icon and get the tooltip text if present
      const tooltipIcon = await element.$('span[class*="list-trim-icon"]');
      if (tooltipIcon) {
        tooltipIcon.click();
        const tooltipText = await this.tooltipValue.textContent();
        if (tooltipText && tooltipText.trim().length > 0) {
          filterValue = tooltipText.trim();
        }
        await this.page.locator('body').click({ position: { x: 0, y: 0 }, force: true, timeout: TIMEOUT_FE_WAIT });
        await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
      }

      filterValues.push(filterValue);
    }

    return { count: resultElements.length, filterValues };
  }

  async runFilterValidation(filterType: string, filterValue: string) {
    await this.selectAndApplyFilter(filterType, filterValue);
    const result = await this.validateResultsByFilter(filterType);
    if (result.count > 0) {
        for (const value of result.filterValues) {
            expect(value).toContain(filterValue);
        }
    } else {
      Logger.log(`No rows found for the filter: ${filterType} = ${filterValue}`); // <-- Use Logger instead of console.log
    }
  }
}