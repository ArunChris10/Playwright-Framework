import { expect, Locator, Page } from "@playwright/test";
import { testData, filterOptions, sortingOptions, groupByOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Logger } from "../../common/fixtures/logger-utils";
import { LandingPageValidation } from "./landing.page";

/**
 * Page Object Model for Landing Page Validation.
 * Encapsulates all actions and assertions for the landing page.
 */
export class TreeViewPage {

  // --- Locators ---
  readonly page: Page;
  readonly landingPage: LandingPageValidation;
  readonly searchBox: Locator;
  readonly btnClearFilter: Locator;
  readonly dataGridTable: string;
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
  readonly tableViewDropdown: Locator;
  readonly treeViewDropdown: Locator;

  // Parameterized XPath generators
  readonly getGridValueXPath: (dataFieldAttribute: string) => string;
  readonly currentFirstChild: (index: number) => string;
  readonly currentLevelTwoChild: (index: number) => string;
  readonly columnSort: (column: string) => string;

  constructor(page: Page, landingPage: LandingPageValidation) {
    this.page = page;
    this.landingPage = landingPage;
    this.searchBox = page.locator('input[type="search"]');
    this.btnClearFilter = page.getByText("Reset");
    this.dataGridTable = ".data-grid-table";
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
    this.tableViewDropdown = page.locator('[data-testid="TableChartIcon"]');
    this.treeViewDropdown = page.locator('[data-testid="AccountTreeIcon"]');

    // Parameterized XPath generators
    this.getGridValueXPath = (dataFieldAttribute: string) =>
      `[data-field="${dataFieldAttribute}"][role="gridcell"]`;
    this.currentFirstChild = (index: number) =>
      `((//li[@aria-expanded='true'])[${index}]//div[contains(@class,'MuiTreeItem-label')])[1]`
    this.currentLevelTwoChild = (index: number) =>
      `(//li[@aria-expanded='true'])[${index}]//ul//li`;
    this.columnSort = (column: string) =>
      `//span[text()="${column}"]`
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
        await this.landingPage.selectAndApplyFilter(columnName, finalValue);
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
    await this.tableViewDropdown.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.tableViewDropdown.click();
    await this.treeViewDropdown.click();
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