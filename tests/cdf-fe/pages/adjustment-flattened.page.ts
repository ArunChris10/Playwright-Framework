import { Locator, Page, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../testdata/create-manualadjustment-flattened.json";

export class ManualAdjustmentFlattened {
  private readonly page: Page;
  readonly intelLayer: string;
  private readonly createLayer: Locator;
  private readonly flattenedMenu: Locator;
  private readonly flattenedNameInput: Locator;
  private readonly flattenedDescInput: Locator;
  private readonly flattenedCreateButton: Locator;
  private readonly adjustmentTab: Locator;
  private readonly updateCellPlaceholderGMV: Locator
  private readonly updateCellPlaceholderUnits: Locator
  private readonly updateCellSave: Locator;
  private readonly gmvHoldPlaceholder: Locator;
  private readonly unitsHoldPlaceholder: Locator;
  private readonly aurHoldPlaceholder: Locator;
  private readonly holdMetricErrorMessage: Locator;
  private readonly holdAURErrorMessage: Locator;

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
    this.flattenedNameInput = this.page.locator("#react-aria-2-21");
      
    this.flattenedDescInput = this.page.locator("#react-aria-2-22");
    this.flattenedCreateButton = this.page.getByRole("button", {
      name: "Create",
    });
    this.adjustmentTab = this.page.getByText("Adjustment", { exact: true });
    this.updateCellPlaceholderGMV = this.page.getByPlaceholder('New $');
    this.updateCellPlaceholderUnits = this.page.getByPlaceholder('New');
    this.updateCellSave = this.page.getByRole('button', { name: 'Save' });
    this.gmvHoldPlaceholder = this.page.getByRole('button', { name: 'GMV shipped' });
    this.unitsHoldPlaceholder = this.page.getByRole('button', { name: 'Scanned Units' });
    this.aurHoldPlaceholder = this.page.getByRole('button', { name: 'AUR' });
    this.holdMetricErrorMessage = this.page.getByText('Cannot hold edited metric');
    this.holdAURErrorMessage = this.page.getByText('Cannot hold AUR when gmv and units are edited');
  }

  async addNameAndDesc({ name, desc }) {
    await this.adjustmentTab.click();
    await this.createLayer.click();
    await this.flattenedMenu.click();
    await this.flattenedNameInput.click();
    await this.flattenedNameInput.fill(name);
    await this.flattenedDescInput.click();
    await this.flattenedDescInput.fill(desc);
    await this.flattenedCreateButton.click();
  }

  async createAndSave() {
    await this.addNameAndDesc({ name: testdata.name, desc: testdata.desc });
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
  }

  /**
   * @returns {string} - current date plus one year and one month
   */
  async getForecastYearMonth() {
    const currentDate: Date = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const formattedDate = `${year}${month.toString().padStart(2, "0")}`;
    return formattedDate;
  }

  /**
   * @param {number} rowIndex - The index of the row in the grid
   * @returns {number} - The value of the cell.
   */
  async getCellfromGrid(rowIndex) {
    const yearMonth = await this.getForecastYearMonth();
    return this.page.locator(
      `//div[@row-index='${rowIndex}']/div[@col-id='${yearMonth}']`
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
    let metric: string, rowIndex: number = 0;
    for (let row = 0; row < rowCount; row++) {
      metric = await this.getMetricGrid(row)
      if (metric == metricToUpdate) {
        rowIndex = row;
        break;
      }
    }
    const cellToEdit = await this.getCellfromGrid(rowIndex);
    await cellToEdit.dblclick();
    await updateCellPlaceholder.fill(testdata.defaultMetricValue);
    await this.updateCellSave.click();
  }

  async editGMVCell() {
    await this.editMetricandSave(testdata.metricGMV, this.updateCellPlaceholderGMV);
    await this.gmvHoldPlaceholder.click();
    await expect(this.holdMetricErrorMessage).toBeVisible();
  }

  async editUnitsCell() {
    await this.page.getByRole('button', { name: 'Reset', exact: true }).click();
    await this.editMetricandSave(testdata.metricUnits, this.updateCellPlaceholderUnits);
    await this.unitsHoldPlaceholder.click();
    await expect(this.holdMetricErrorMessage).toBeVisible();
  }

  async editGMVandUnitsCells() {
    await this.page.getByRole('button', { name: 'Reset', exact: true }).click();
    await this.editMetricandSave(testdata.metricGMV, this.updateCellPlaceholderGMV);
    await this.editMetricandSave(testdata.metricUnits, this.updateCellPlaceholderUnits);
    await this.aurHoldPlaceholder.click()
    await expect(this.holdAURErrorMessage).toBeVisible();
  }

}
