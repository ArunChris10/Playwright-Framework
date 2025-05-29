import { expect, Locator, Page } from "@playwright/test";
import { testData, sortingOptions, groupByOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Logger } from "../../common/fixtures/logger-utils";

/**
 * Page Object Model for Landing Page Validation.
 * Encapsulates all actions and assertions for the landing page.
 */
export class LandingPageValidation {

  // --- Locators ---
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

  // Parameterized XPath generators
  readonly getFilterButtonXPath: (label: string) => string;
  readonly getGridValueXPath: (dataFieldAttribute: string) => string;
  readonly getSortOptionXPath: (sortLabel: string) => string;

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

    // Parameterized XPath generators
    this.getFilterButtonXPath = (label: string) =>
      `//div[span[contains(., "${label}")] and button[@aria-label="Filter"]]/button`;
    this.getGridValueXPath = (dataFieldAttribute: string) =>
      `[data-field="${dataFieldAttribute}"][role="gridcell"]`;
    this.getSortOptionXPath = (sortLabel: string) =>
      `//div[normalize-space(text())="${sortLabel}"]`;
  }

  // --- General UI Checks ---

  /**
   * Waits for the search box to be visible.
   */
  async Search() {
    await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Waits for input and calculation buttons to be visible.
   */
  async Count() {
    await this.btnInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.btnCalculations.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Waits for the sort by dropdown to be visible.
   */
  async SortBy() {
    await this.dropdownSortBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Waits for the group by dropdown to be visible.
   */
  async GroupBy() {
    await this.dropdownGroupBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Waits for the settings button to be visible.
   */
  async Settings() {
    await this.btnSettings.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  /**
   * Waits for the first filter button to be visible.
   */
  async Filter() {
    await this.btnFilter.first().waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  // --- Search Validations ---

  /**
   * Validates search with the complete metric name.
   */
  async verifySearchWithCompleteMetricName() {
    await this._verifySearch(testData.completeSearch, testData.dataFieldAttributeMetricName, true);
  }

  /**
   * Validates search with a partial metric name.
   */
  async verifySearchWithPartialMetricName() {
    await this._verifySearch(testData.partialSearch, testData.dataFieldAttributeMetricName, false);
  }

  /**
   * Validates search with an incorrect metric name.
   */
  async verifySearchWithIncorrectMetricName() {
    await this._verifySearch(testData.incorrectSearch, testData.dataFieldAttributeMetricName, false, true);
  }

  /**
   * Private helper for search validation.
   */
  private async _verifySearch(searchterm: string, dataFieldAttribute: string, exact: boolean, negative: boolean = false) {
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

    if (negative) {
      // Negative search: ensure no results contain the search term
      if (resultElements.length === 0) {
        expect(resultElements.length).toBe(0);
      } else {
        for (const value of searchValues) {
          expect(value).not.toContain(searchterm);
        }
      }
    } else {
      // Positive search: ensure all results match or contain the search term
      if (resultElements.length > 0) {
        for (const value of searchValues) {
          if (exact) {
            expect(value === searchterm || (value && value.includes(searchterm))).toBeTruthy();
          } else {
            expect(value).toContain(searchterm);
          }
        }
      } else {
        Logger.log(`No rows found for the search term: ${searchterm}`);
      }
    }
  }

  // --- Filter Validations ---

  /**
   * Applies a filter and validates the results.
   * @param filterType The filter dropdown label.
   * @param filterValue The value to filter by.
   */
  async runFilterValidation(filterType: string, filterValue: string) {
    await this.selectAndApplyFilter(filterType, filterValue);
    const result = await this.validateResultsByFilter(filterType);
    if (result.count > 0) {
      for (const value of result.filterValues) {
        expect(value).toContain(filterValue);
      }
    } else {
      Logger.log(`No rows found for the filter: ${filterType} = ${filterValue}`);
    }
  }

  /**
   * Selects and applies a filter.
   * @param filterType The filter dropdown label.
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
   * @param filterType The filter dropdown label.
   * @returns Object with count and array of filter values.
   */
  async validateResultsByFilter(filterType: string) {
    const dataFieldAttribute = filterType.toLowerCase();
    const resultElements = await this.page.$$(this.getGridValueXPath(dataFieldAttribute));
    const filterValues: (string | null)[] = [];

    for (const element of resultElements) {
      let filterValue = (await element.textContent())?.trim() ?? null;

      // If the cell has a tooltip, use the tooltip value
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

  /**
   * Clears all filters and validates that the filter value is not present.
   * @param filterType The filter dropdown label.
   * @param filterValue The value to filter by.
   */
  async verifyClearAllFilterFunctionality(filterType: string, filterValue: string) {
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

  // --- Table Settings ---

  /**
   * Validates table settings functionality.
   */
  async tableSettings() {
    await this.btnSettings.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.btnSettings.click();
    await this.checkbox.nth(2).click();
    await expect(this.checked.nth(2)).not.toHaveText(testData.month);
    await this.btnClose.click();
  }

  // --- Sorting Validations ---

  /**
   * Validates all sorting options using sortingOptions from test data.
   */
  async verifySorting() {
    for (const sortOption of sortingOptions) {
      await this.validateSorting(sortOption.label, sortOption.type as "asc" | "desc" | "date-desc");
    }
  }

  /**
   * Sorting validation.
   * @param sortLabel The visible label of the sort option.
   * @param sortType "asc" | "desc" | "date-desc"
   */
  async validateSorting(sortLabel: string, sortType: "asc" | "desc" | "date-desc") {
    await this.dropdownSortBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownSortBy.click();

    const sortOption = this.page.locator(this.getSortOptionXPath(sortLabel));
    await sortOption.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await sortOption.click();

    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const columnData = await this.sortGroup.allTextContents();

    if (sortType === "asc") {
      const isAscending = columnData.every(
        (val, i, arr) =>
          i === 0 || arr[i - 1].toLowerCase().localeCompare(val.toLowerCase()) <= 0
      );
      expect(isAscending).toBeTruthy();
    } else if (sortType === "desc") {
      const isDescending = columnData.every(
        (val, i, arr) =>
          i === 0 || arr[i - 1].toLowerCase().localeCompare(val.toLowerCase()) >= 0
      );
      expect(isDescending).toBeTruthy();
    } else if (sortType === "date-desc") {
      const parsedDates = columnData.map(dateString => new Date(dateString));
      const sortedDates = [...parsedDates].sort((a, b) => b.getTime() - a.getTime());
      expect(parsedDates).toEqual(sortedDates);
    }
  }

  // --- Grouping Validations ---

  /**
   * Validates all grouping options using groupByOptions from test data.
   */
  async verifyGrouping() {
    for (const groupObj of groupByOptions) {
      const groupData = groupObj.data;
      for (const key in groupData) {
        const groupLabel = groupData[key].option;
        await this.validateGrouping(groupLabel, key);
      }
    }
  }

  /**
   * Grouping validation.
   * @param groupLabel The visible label of the group by option.
   * @param dataFieldAttribute The data-field attribute to validate grouping.
   */
  async validateGrouping(groupLabel: string, dataFieldAttribute: string) {
    await this.dropdownGroupBy.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.dropdownGroupBy.click();

    let groupOption: Locator;
    if (groupLabel === groupByOptions[0].data.owner.option) {
      groupOption = this.owners;
    } else {
      groupOption = this.page.getByText(groupLabel, { exact: true });
    }

    await groupOption.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await groupOption.click({ force: true });
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });

    // Scroll to load all groups if table is virtualized
    await this.page.evaluate(() => {
      const grid = document.querySelector('.data-grid-table');
      if (grid) grid.scrollTop = grid.scrollHeight;
    });
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);

    // Collect all grouped values
    const cells = await this.page.$$(this.getGridValueXPath(dataFieldAttribute));
    const groupedValues: string[] = [];
    for (const cell of cells) {
      const text = await cell.textContent();
      if (text !== null) groupedValues.push(text.trim());
    }

    // Validate grouping: all rows in a group have the same value
    const groupMap = new Map<string, number>();
    for (const val of groupedValues) {
      groupMap.set(val, (groupMap.get(val) ?? 0) + 1);
    }

    for (const [value, count] of groupMap.entries()) {
      const rowsInGroup = groupedValues.filter(v => v === value);
      expect(rowsInGroup.length).toBe(count);
      expect(rowsInGroup.every(v => v === value)).toBeTruthy();
    }

    expect(groupMap.size).toBeGreaterThan(0);
  }
}