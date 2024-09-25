import { Locator, Page, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../testdata/create-manualadjustment-flattened.json";

export class ManualAdjustmentFlattened {
  private readonly page: Page;
  readonly intelLayer: string;
  private readonly createLayer: Locator;
  private readonly flattenedMenu: Locator;
  private readonly dialogModal: Locator;
  private readonly flattenedNameInput: Locator;
  private readonly flattenedDescInput: Locator;
  private readonly flattenedCreateButton: Locator;
  private readonly adjustmentTab: Locator;
  private readonly updateCellPlaceholderGMV: Locator;
  private readonly updateCellPlaceholderUnits: Locator;
  private readonly updateCellSave: Locator;
  private readonly gmvHoldPlaceholder: Locator;
  private readonly unitsHoldPlaceholder: Locator;
  private readonly aurHoldPlaceholder: Locator;
  private readonly holdMetricErrorMessage: Locator;
  private readonly holdAURErrorMessage: Locator;
  private readonly calculateButton: Locator;
  private readonly downloadMenu: Locator;
  private readonly downloadMenuItem: Function;
  private readonly resetButton: Locator;

  // Filter related elements
  private readonly filterModal: Locator;
  private readonly filterModalConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.intelLayer =
      '//div[contains(@col-id,"intelName") and @role="gridcell"]';
    this.createLayer = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    this.flattenedMenu = this.page.getByRole("menuitem", {
      name: "Manual Adjustment - flattened",
    });
    this.dialogModal = this.page.getByRole("dialog");
    this.flattenedNameInput = this.dialogModal.locator("input").first();
    this.flattenedDescInput = this.dialogModal.locator("textarea").first();
    this.flattenedCreateButton = this.page.getByRole("button", {
      name: "Create",
    });
    this.adjustmentTab = this.page.getByText("Adjustment", { exact: true });
    this.updateCellPlaceholderGMV = this.page.getByPlaceholder("New");
    this.updateCellPlaceholderUnits = this.page.getByPlaceholder("New");
    this.updateCellSave = this.page.getByRole("button", { name: "Save" });
    this.gmvHoldPlaceholder = this.page.getByRole("button", {
      name: "GMV shipped",
    });
    this.unitsHoldPlaceholder = this.page.getByRole("button", {
      name: "Scanned Units",
    });
    this.aurHoldPlaceholder = this.page.getByRole("button", { name: "AUR" });
    this.holdMetricErrorMessage = this.page.getByText(
      "Cannot hold edited metric"
    );
    this.holdAURErrorMessage = this.page.getByText(
      "Cannot hold AUR when gmv and units are edited"
    );
    this.calculateButton = this.page.getByRole("button", { name: "Calculate" });
    this.downloadMenu = this.page
      .getByTitle("Export Data Science Output")
      .locator("svg")
      .first();
    this.downloadMenuItem = function (type: "CSV" | "Excel" = "CSV") {
      return this.page.getByRole("menuitem", {
        name: `${type} Export`,
      });
    };
    this.resetButton = this.page.getByRole("button", {
      name: "Reset",
      exact: true,
    });

    this.filterModal = this.page.locator('div[class*="BasePopover-module_content"]')
    this.filterModalConfirmButton = this
        .filterModal
        .getByRole("button", { name: "Confirm" })
  }

  async addNameAndDesc({ name, desc }: { name: string; desc: string }) {
    await this.adjustmentTab.click();
    await this.createLayer.click();
    await this.flattenedMenu.click();
    await this.flattenedNameInput.fill(name);
    await this.flattenedDescInput.fill(desc);
    await this.flattenedCreateButton.click();
  }

  async createAndSave() {
    await this.addNameAndDesc({ name: testdata.name, desc: testdata.desc });
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
  }

  /**
   * @param {number} rowIndex - The index of the row in the grid
   * @param {number} colIndex - The index of the column in the grid
   * @returns {number} - The value of the cell.
   */
  async getCellfromGrid(rowIndex, colIndex) {
    return this.page.locator(
      `//div[@row-index='${rowIndex}']/div[@col-id='${colIndex}']`
    );
  }

  async getMetricGrid(row) {
    return this.page
      .locator(`//div[@row-index='${row}']/div[@col-id='metric']`)
      .innerText();
  }

  async editMetricandSave(metricToUpdate, updateCellPlaceholder) {
    const rowCount: number = await this.page.$$eval(
      "div.ag-pinned-left-cols-container > div",
      (divs) => divs.length
    );
    let metric: string,
      rowIndex: number = 0;
    for (let row = 0; row < rowCount; row++) {
      metric = await this.getMetricGrid(row);
      if (metric == metricToUpdate) {
        rowIndex = row;
        break;
      }
    }
    const colIndex = Utility.getMonthYear();
    const cellToEdit = await this.getCellfromGrid(rowIndex, colIndex);
    await cellToEdit.dblclick();
    await updateCellPlaceholder.fill(testdata.defaultMetricValue);
    await this.updateCellSave.click();
    return rowIndex;
  }

  async editGMVCell() {
    await this.editMetricandSave(
      testdata.metricGMV,
      this.updateCellPlaceholderGMV
    );
    await this.gmvHoldPlaceholder.click();
    await expect(this.holdMetricErrorMessage).toBeVisible();
  }

  async editGMVAndSBUCell() {
    const rowIndex = await this.editMetricandSave(
      testdata.metricGMV,
      this.updateCellPlaceholderGMV
    );
    await this.unitsHoldPlaceholder.click();
    return (await this.getCellfromGrid(rowIndex, "sbu")).innerText();
  }

  async editUnitsCell() {
    await this.resetButton.click();
    await this.editMetricandSave(
      testdata.metricUnits,
      this.updateCellPlaceholderUnits
    );
    await this.unitsHoldPlaceholder.click();
    await expect(this.holdMetricErrorMessage).toBeVisible();
  }

  async editGMVandUnitsCells() {
    await this.resetButton.click();
    await this.editMetricandSave(
      testdata.metricGMV,
      this.updateCellPlaceholderGMV
    );
    await this.editMetricandSave(
      testdata.metricUnits,
      this.updateCellPlaceholderUnits
    );
    await this.aurHoldPlaceholder.click();
    await expect(this.holdAURErrorMessage).toBeVisible();
  }

  async calculateUpdatedCells() {
    await this.calculateButton.click();
    await Utility.waitForSpinnerToBeInvisible(this.page);
  }

  async download(type: "CSV" | "Excel" = "CSV") {
    await this.downloadMenu.click();
    await this.downloadMenuItem(type).click();
    const download = await this.page.waitForEvent("download");
    return type == "CSV"
      ? await Utility.downloadCSV(download)
      : await Utility.downloadExcel(download);
  }

  async openFilterDropdown(filterType: string) {
    const filterDropdownButton = this.page.getByRole('button', { name: filterType })
    await filterDropdownButton.click();
  }

  async applyFilterOptions(labels: string[] | string) {
    const labelArray = [ labels ].flat()

    for (const label of labelArray) {
      await this.filterModal.getByLabel(label).check()
    }

    await this.filterModalConfirmButton.click()
    await Utility.waitForSpinnerToBeInvisible(this.page)
  }

  async checkFilterOption(label: string) {
    const option = this.filterModal.getByLabel(label, { exact: true })
    return await option.check()
  }

  async uncheckFilterOption(label: string) {
    const option = this.filterModal.getByLabel(label, { exact: true })
    return await option.uncheck()
  }

  async clearFilterOptions()   {
    const checkboxes = this.filterModal.getByRole('checkbox')
    for (const checkbox of await checkboxes.all()) {
      await checkbox.uncheck()
    }
  }

  async isColumnHeaderVisible(name: string) {
    return this.page.getByRole(
        'columnheader', { name: name.toUpperCase() }
    ).isVisible()
  }

  async applyColumnFiltersAndAssertVisibility(labels: string | string[]) {
    const labelArray = [ labels ].flat()

    await this.openFilterDropdown(testdata.columns.filterName);
    await this.clearFilterOptions()
    await this.applyFilterOptions(labelArray)

    for (const columnName of Object.values<string>(testdata.columns.filterLabels)) {
      const isColumnNameVisible = await this.isColumnHeaderVisible(columnName)
      expect(isColumnNameVisible).toBe(labels.includes(columnName))
    }
  }

  async assertOptionsVisibleInOpenFilterDropdown(labels: string[], groupName?: string): Promise<Locator[]> {
    const parentElement = groupName
        ? this.filterModal.getByRole('group', { name: groupName })
        : this.filterModal

    const optionLocators: Locator[] = []
    for (const label of labels) {
      const option = parentElement.getByLabel(label, { exact: true })
      await expect(option).toBeVisible()
      optionLocators.push(option)
    }

    return optionLocators
  }
}
