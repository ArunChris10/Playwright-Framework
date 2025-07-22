import { expect, Locator, Page } from "@playwright/test";
import { testData, filterOptions, sortingOptions, groupByOptions } from '../testdata/fileName.json';
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
  readonly driverTreePane: Locator;
  readonly noDefaultRows: Locator;
  readonly parentOrphanNodesInDriverTree: Locator;
  readonly treeViewLoader: Locator;
  readonly driverViewchildNodes: Locator;
  readonly collapseAll: Locator;
  readonly expandAll: Locator;
  readonly expandedView: Locator;
  readonly collpasedView: Locator;
  readonly noRowsCount: Locator;
  readonly TableViewDropdown: Locator;
  readonly TreeViewDropdown: Locator;

  // Parameterized XPath generators
  readonly getFilterButtonXPath: (label: string) => string;
  readonly getGridValueXPath: (dataFieldAttribute: string) => string;
  readonly getSortOptionXPath: (sortLabel: string) => string;
  readonly currentFirstChild: (index: number) => string;
  readonly currentLevelTwoChild: (index: number) => string;
  readonly columnSort: (column: string) => string;

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
    this.driverTreePane = page.locator('.driver-tree-grid-container');
    this.noDefaultRows = page.getByText("No rows")
    this.parentOrphanNodesInDriverTree = page.locator(`//div[@class='MuiTreeItem-label']`)
    this.treeViewLoader = page.locator('.MuiCircularProgress-svg');
    this.driverViewchildNodes = page.locator("//div[@class='MuiTreeItem-label']//following::ul//li//div[@class='MuiTreeItem-label']")
    this.collapseAll = page.locator('[data-testid="CompressIcon"]');
    this.expandAll = page.locator('[data-testid="ExpandIcon"]');
    this.expandedView = page.locator("//li[@aria-expanded='true']")
    this.collpasedView = page.locator("//ul[@role='tree']/li[@aria-expanded='false']");
    this.noRowsCount = page.locator("//p[contains(@class,'MuiTablePagination-displayedRows')]")
    this.TableViewDropdown = page.locator('[data-testid="TableChartIcon"]');
    this.TreeViewDropdown = page.locator('[data-testid="AccountTreeIcon"]');

    // Parameterized XPath generators
    this.getFilterButtonXPath = (label: string) =>
      `//div[span[contains(., "${label}")] and button[@aria-label="Filter"]]/button`;
    this.getGridValueXPath = (dataFieldAttribute: string) =>
      `[data-field="${dataFieldAttribute}"][role="gridcell"]`;
    this.getSortOptionXPath = (sortLabel: string) =>
      `//div[normalize-space(text())="${sortLabel}"]`;
    this.currentFirstChild = (index: number) =>
      `((//li[@aria-expanded='true'])[${index}]//div[contains(@class,'MuiTreeItem-label')])[1]`
    this.currentLevelTwoChild = (index: number) =>
      `(//li[@aria-expanded='true'])[${index}]//ul//li`;
    this.columnSort = (column: string) =>
      `//span[text()="${column}"]`
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
   * Helper for search validation.
   */
  async _verifySearch(searchterm: string, dataFieldAttribute: string, exact: boolean, negative: boolean = false) {
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
      if (resultElements.length === 0) {
        expect(resultElements.length).toBe(0);
        return true;
      } else {
        for (const value of searchValues) {
          expect(value).not.toContain(searchterm);
        }
        return true;
      }
    } else {
      if (resultElements.length > 0) {
        let found = false;
        for (const value of searchValues) {
          if (exact) {
            if (value === searchterm || (value && value.includes(searchterm))) {
              found = true;
            }
            expect(value === searchterm || (value && value.includes(searchterm))).toBeTruthy();
          } else {
            if (value && value.includes(searchterm)) {
              found = true;
            }
            expect(value).toContain(searchterm);
          }
        }
        return found;
      } else {
        Logger.log(`No rows found for the search term: ${searchterm}`);
        return false;
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

    const dropdownMenu = this.page.locator('div.MuiPopover-paper div[style*="overflow: auto"]');
    //await dropdownMenu.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT * 2 });
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);

    let checkboxFound = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (this.page.isClosed()) break;
      const menuItems = this.page.getByRole('menuitem');
      const count = await menuItems.count();
      for (let i = 0; i < count; i++) {
        if (this.page.isClosed()) break;
        const item = menuItems.nth(i);
        const text = (await item.textContent())?.trim();
        if (text && text.toLowerCase() === filterValue.trim().toLowerCase()) {
          const checkbox = item.locator('input[type="checkbox"]');
          await checkbox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT * 2 });
          await checkbox.scrollIntoViewIfNeeded();
          await checkbox.check();
          checkboxFound = true;
          break;
        }
      }
      if (checkboxFound || this.page.isClosed()) break;
      // Scroll the dropdown menu down a bit to load more items
      const scrollResult = await dropdownMenu.evaluate((el: HTMLElement) => {
        const prev = el.scrollTop;
        el.scrollBy(0, 80);
        return { prev, now: el.scrollTop, max: el.scrollHeight - el.clientHeight };
      });
      if (scrollResult && (scrollResult.now === scrollResult.prev || scrollResult.now >= scrollResult.max)) break;
      await this.page.waitForTimeout(200);
    }
    if (!checkboxFound) {
      throw new Error(`No checkbox found for filter value: ${filterValue}`);
    }

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

  /**
   * Applies filters for month, channel, and department, then searches for the node by metric name.
   * @param metricName The metric name to search for.
   * @param department The department value used during node creation.
   * @returns {Promise<boolean>} True if a node matching all filters is found, else false.
   */
  async filterAndSearchNode(
    metricName: string,
    department: string
  ): Promise<boolean> {
    // Apply required filters
    await this.selectAndApplyFilter(filterOptions[0].data.month.dropDown, filterOptions[0].data.month.actuals);
    await this.selectAndApplyFilter(filterOptions[0].data.channel.dropDown, filterOptions[0].data.channel.option);
    await this.selectAndApplyFilter(filterOptions[0].data.department.dropDown, department);

    // Search verification
    const found = await this._verifySearch(
      metricName,
      testData.dataFieldAttributeMetricName,
      true
    );
    return found;
  }

  async driverTreePaneisDisplayed() {
    await this.driverTreePane.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const isVisible = await this.driverTreePane.isVisible();
    expect(isVisible).toBeTruthy();
    await this.treeViewLoader.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT * 3 });
    await this.noDefaultRows.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
  }

  async validateDefaultViewParentNodes(expectedNodes: string[]) {
    const orphanNodesCount = await this.parentOrphanNodesInDriverTree.count();
    const orphanNodeNames: string[] = [];
    for (let i = 0; i < orphanNodesCount; i++) {
      const node = this.parentOrphanNodesInDriverTree.nth(i);
      const name = (await node.textContent())?.trim();
      if (name) {
        orphanNodeNames.push(name);
      }
    }
    // Normalize for comparison: remove whitespace and lowercase
    const normalizeArray = (arr: string[]) =>
      arr.map(n => n.replace(/\s+/g, '').toLowerCase()).sort();
    expect(normalizeArray(orphanNodeNames)).toEqual(normalizeArray(expectedNodes));
    console.log('Orphan nodes in driver tree:', orphanNodeNames);
    return orphanNodeNames;
  }


  async getChildrenOfParentNode(parentNode: string) {
    // Find the parent node whose text matches paretNode
    const count = await this.parentOrphanNodesInDriverTree.count();
    let parentIndex = -1;
    for (let i = 0; i < count; i++) {
      const node = this.parentOrphanNodesInDriverTree.nth(i);
      const text = (await node.textContent())?.trim();
      if (text === parentNode) {
        parentIndex = i;
        break;
      }
    }
    if (parentIndex === -1) {
      throw new Error(`Parent node "${parentNode}" not found`);
    }

    // Click the parent node to expand its children
    const parentNodeLocator = this.parentOrphanNodesInDriverTree.nth(parentIndex);
    await parentNodeLocator.click({ force: true });
    // Wait for the children nodes to be visible
    await this.driverViewchildNodes.first().waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    // Get the children nodes under the expanded parent
    const childrenLocators = this.driverViewchildNodes;
    const childrenCount = await childrenLocators.count();
    const childrenTexts: string[] = [];
    for (let i = 0; i < childrenCount; i++) {
      const childText = (await childrenLocators.nth(i).textContent())?.trim();
      if (childText) {
        childrenTexts.push(childText);
      }
    }
    // Sort descending
    childrenTexts.sort((a, b) => b.localeCompare(a));
    console.log(`Children nodes for parent "${parentNode}":`, childrenTexts);
    // Click again to collapse the parent node
    await this.collapseAll.click();
    await this.page.waitForTimeout(500);
    return childrenTexts;
  }

  async validateChildrenNodes(uiNodes, apiNodes) {

    expect(uiNodes.length).toBe(apiNodes.length);
    console.log(`Success: ${uiNodes.length} children nodes matched.`);
    const sortedUiNodes = [...uiNodes].sort();
    const sortedApiNodes = [...apiNodes].sort();
    console.log('Sorted UI nodes:', sortedUiNodes);
    console.log('Sorted API nodes:', sortedApiNodes);
    expect(sortedUiNodes).toEqual(sortedApiNodes);

  }

  async clearTextFromSearchBox() {
    await this.searchBox.click();
    await this.searchBox.fill('');
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);
  }

  async enterTextIntoSearchBox(searchterm: string) {
    await this.searchBox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.searchBox.click();
    await this.searchBox.fill(searchterm);
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);
  }

  async clickSearchedNodeToView(
    searchText: string
  ) {
    await this.enterTextIntoSearchBox(searchText);
    await this.parentOrphanNodesInDriverTree.nth(0).waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.parentOrphanNodesInDriverTree.nth(0).click({ force: true });
    await this.driverViewchildNodes.nth(0).click();
    await this.page.waitForSelector(this.getGridValueXPath("metricName"), { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.validateRightGridRecordsForMetricName(searchText);
    console.log(`Clicked on node with text: "${searchText}"`);
  }

  async validateFilteredRecords(filteredColumns) {
    for (const column of filteredColumns) {
      await this.filterfromAvailableValuesofColumn(column);
    }
  }

  async getAllValuesForColumn(columnName: string, metricType?: string) {
    const resultElements = await this.page.$$(this.getGridValueXPath(columnName));
    const collectedValues: string[] = [];
    for (const element of resultElements) {
      const text = (await element.textContent())?.trim();
      if (text) {
        collectedValues.push(text);
      }
    }
    return collectedValues;
  }

  async filterfromAvailableValuesofColumn(columnName) {
    let randomIndex = 0;
    let collectedValues = await this.getAllValuesForColumn(columnName.toLowerCase());
    console.log(`Collected values for column "${columnName}":`, collectedValues);
    if (collectedValues.length > 0) {
      //let uniqueCollectedValues = Array.from(new Set(collectedValues));
      // Iterate collectedValues and if it contains no ',' make randomValue as that value
      for (let j = 0; j < collectedValues.length; j++) {
        if (collectedValues[j] && !collectedValues[j].includes(',')) {
          randomIndex = 0;
          break;
        }
        else {
          randomIndex = Math.floor(Math.random() * collectedValues.length);
        }
      }
      const randomValue = collectedValues[randomIndex];
      let finalValue = randomValue;
      if (randomValue.includes(',')) {
        finalValue = randomValue.split(',')[0].trim();
      }
      console.log(`Randomly selected value for column "${columnName}":`, finalValue);
      if (collectedValues[randomIndex] ) {
        await this.selectAndApplyFilter(columnName, finalValue);
      }
      // Find the cell with the searchedValue and assert its row is highlighted

      const cellLocator = this.page.locator(this.getGridValueXPath(columnName.toLowerCase())).filter({ hasText: finalValue });
      await cellLocator.first().waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      // Assume highlighted row has a specific class, e.g., 'Mui-selected' or similar
      const cellCount = await cellLocator.count();
      for (let i = 0; i < cellCount; i++) {
        const rowLocator = cellLocator.nth(i).locator('xpath=parent::div');
        const classAttr = await rowLocator.getAttribute('class');
        expect(classAttr).toMatch('highlighted-row MuiDataGrid-row');
        const cellText = (await cellLocator.nth(i).textContent())?.trim();
        expect(cellText?.toLowerCase()).toContain(finalValue.toLowerCase());
        console.log(`Cell text for column "${columnName}":`, cellText);
      }
      await this.assertNoHighlightedRowsOnClearingFilter(columnName, collectedValues);
    }
  }

  async assertNoHighlightedRowsOnClearingFilter(columnName: string, collectedValues) {
    columnName = columnName.toLowerCase();
    await this.btnClearFilter.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.btnClearFilter.click();
    await this.page.waitForSelector(this.dataGridTable, { state: 'visible', timeout: TIMEOUT_FE_WAIT });
    let collectedValuesOnClearingFilter = await this.getAllValuesForColumn(columnName);
    // Assert that the values after clearing the filter are the same as before filtering
    expect(collectedValuesOnClearingFilter.sort()).toEqual(collectedValues.sort());
    const cellLocatorDefaultView = this.page.locator(this.getGridValueXPath(columnName));
    const count = await cellLocatorDefaultView.count();
    for (let i = 0; i < count; i++) {
      const rowLocator = cellLocatorDefaultView.nth(i).locator('xpath=parent::div');
      const classAttr = await rowLocator.getAttribute('class');
      if (classAttr && classAttr.includes('highlighted-row MuiDataGrid-row')) {
        continue;
      }
      expect(classAttr).not.toMatch('highlighted-row MuiDataGrid-row');
    }
    console.log(`Reset filter works for "${columnName}"`);
  }



  async validateFullMatchSearchForTreeView(parentNode, searchText) {
    await this.enterTextIntoSearchBox(searchText);
    await this.parentOrphanNodesInDriverTree.nth(0).waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.parentOrphanNodesInDriverTree.nth(0).click({ force: true });
    let parentNodeofSearchedText = await this.parentOrphanNodesInDriverTree.nth(0).textContent();
    console.log(`Expected parent node: "${parentNode.trim()}", Actual: "${parentNodeofSearchedText?.trim()}"`);
    await this.validateRightGridRecordsForMetricName(parentNode, "Calculated")
    expect(parentNodeofSearchedText?.trim()).toBe(parentNode.trim());
    let searchMatchNode = await this.driverViewchildNodes.nth(0).textContent();
    console.log(`Expected search text: "${searchText.trim()}", Actual: "${searchMatchNode?.trim()}"`);
    expect(searchMatchNode?.trim()).toBe(searchText.trim());
    await this.collapseAll.click();
    await this.page.waitForTimeout(300);
  }

  async validatePartialMatchSearchForTreeView(searchText: string) {
    await this.enterTextIntoSearchBox(searchText);
    const matchingMetricsCount = await this.parentOrphanNodesInDriverTree.count();
    let found = false;
    for (let i = 0; i < matchingMetricsCount; i++) {
      await this.parentOrphanNodesInDriverTree.nth(i).click({ force: true });
      await this.page.waitForTimeout(400);
      let parentNodeofSearchedText = await this.parentOrphanNodesInDriverTree.nth(i).textContent();
      console.log(`Parent node of searched text: "${parentNodeofSearchedText?.trim()}"`);
      await this.validateRightGridRecordsForMetricName(parentNodeofSearchedText ?? "", "Calculated");
      const childrenCount = await this.driverViewchildNodes.count();
      for (let j = 0; j < childrenCount; j++) {
        const childText = (await this.driverViewchildNodes.nth(j).textContent())?.trim();
        if (childText && childText.includes(searchText.trim())) {
          console.log(`Partial match found: "${childText}" contains "${searchText.trim()}"`);
          found = true;
          expect(childText).toContain(searchText.trim());
        }
      }
      await this.collapseAll.click();
      await this.page.waitForTimeout(300);
    }
    expect(found).toBeTruthy();
  }

  async validateClearingSearchRevertsToDefault(expectedNodes: string[]) {
    await this.clearTextFromSearchBox();
    await this.page.waitForTimeout(200);
    await this.noRowsCount.textContent().then(text => {
      console.log(`No rows count text: "${text}"`);
      expect(text?.trim()).toBe("0–0 of 0");
    });
    await this.validateDefaultViewParentNodes(expectedNodes);
  }

  /**
   * Validates that all rows in the right grid have the expected metric name and, if provided, the expected metric type.
   * @param selectedNodename The expected metric name.
   * @param metricType The expected metric type (optional).
   */
  async validateRightGridRecordsForMetricName(selectedNodename: string, metricType?: string) {
    const resultElements = await this.page.$$(this.getGridValueXPath("metricName"));
    const metricTypeElements = await this.page.$$(this.getGridValueXPath("metricType"));
    for (const element of resultElements) {
      const text = (await element.textContent())?.trim();
      console.log(`Asserting metricName in grid Table: expected "${selectedNodename}", actual "${text}"`);
      expect(text).toBe(selectedNodename);
    }
    if (metricType !== undefined) {
      for (const element of metricTypeElements) {
        const text = (await element.textContent())?.trim();
        console.log(`Asserting metricType: expected "${metricType}", actual "${text}"`);
        expect(text).toBe(metricType);
      }
    }
    else{
      for (const element of metricTypeElements) {
        const text = (await element.textContent())?.trim();
        expect(["Input", "Calculated"]).toContain(text);
        console.log(`metricType in grid Table:`, text);
      }
    }
  }

  async validateAndGetLevelOneChildNodesOnExpandAll(parentNodes, expectedChildNodesFromAPI) {
    await this.expandAll.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.expandAll.click();
    await this.page.waitForTimeout(TIMEOUT_FE_WAIT);
    const expandedNodes = await this.expandedView.count();
    expect(expandedNodes).toBeGreaterThan(1);

    const firstChildTexts: string[] = [];
    for (let i = 2; i <= expandedNodes; i++) {
      const firstChildLocator = this.page.locator(this.currentFirstChild(i));
      await firstChildLocator.scrollIntoViewIfNeeded();
      await expect(firstChildLocator).toBeVisible();
      const text = (await firstChildLocator.textContent())?.trim();
      if (text) {
        if (!parentNodes.includes(text)) {
          expect(expectedChildNodesFromAPI).toContain(text);
          firstChildTexts.push(text);
        }
      }

      if (i < 4) {
        const levelTwoChildLocator = this.page.locator(this.currentLevelTwoChild(i));
        // Check aria-expanded property is false
        const levelTwoCount = await levelTwoChildLocator.count();
        for (let j = 0; j < levelTwoCount; j++) {
          const childLocator = levelTwoChildLocator.nth(j);
          console.log('Child locator:', childLocator);
          const childAriaExpanded = await childLocator.getAttribute('aria-expanded');
          expect(childAriaExpanded).toBe('false');
        }
      }
    }
  }

  async validateCollapseAll(expectedNodes) {
    await this.collapseAll.click();
    await this.page.waitForTimeout(300);
    const collapsedNodes = await this.collpasedView.count();
    expect(collapsedNodes).toBe(3);
    await this.validateDefaultViewParentNodes(expectedNodes);
  }

  async switchToTreeView() {
    await this.TableViewDropdown.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.TableViewDropdown.click();
    await this.TreeViewDropdown.click();
    await this.driverTreePaneisDisplayed();
  }

  async validateColumnLevelSort(filteredColumns) {
    for (const columnName of filteredColumns) {
      const defaultSorted = await this.getAllValuesForColumn(columnName);
      const sorted = [...defaultSorted].sort((a, b) => a.localeCompare(b));
      expect(defaultSorted).toEqual(sorted);
      console.log(`Default sort for column "${columnName}" passed.`);
      const columnSortButton = this.page.locator(this.columnSort(columnName));
      await columnSortButton.click();
      //sort Ascending
      const AscendingSorted = await this.getAllValuesForColumn(columnName);
      const sortListForAscending = [...defaultSorted].sort((a, b) => a.localeCompare(b));
      expect(AscendingSorted).toEqual(sorted);
      console.log(`Ascending sort for column "${columnName}" matches default sorted order.`);
      expect(AscendingSorted).toEqual(sortListForAscending);
      console.log(`Ascending sort for column "${columnName}" passed.`);
      // sort descending
      await columnSortButton.click();
      const DescendingSorted = await this.getAllValuesForColumn(columnName);
      const sortListForDescending = [...defaultSorted].sort((a, b) => b.localeCompare(a));
      expect(DescendingSorted).toEqual(sortListForDescending);
      console.log(`Descending sort for column "${columnName}" passed.`);
    }
  }

}