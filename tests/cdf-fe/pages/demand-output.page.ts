import { Locator, Page, expect } from "@playwright/test";
import testdata from "../testdata/create-demandoutput.json";
import { Utility } from "../../common/fixtures/utils";

export class DemandOutput {
  private readonly page: Page;
  private dataLoading = "//span[contains(@class, 'ag-group-value')]";
  private gridLabelTest;
  private readonly sbuButton: Locator;
  private readonly clearSbuButton: Locator;
  private readonly confirmSbuButton: Locator;
  private readonly resetFilter: Locator;
  private readonly selectedFilter: Locator;
  private readonly metricDropdown: Locator;
  private readonly exportMenu: Locator;
  private readonly downloadExcelBtn: Locator;
  private readonly aurRadioBtn: Locator;
  private readonly forecastProjectionBtn;

  constructor(page: Page) {
    this.page = page;
    this.sbuButton = this.page.getByRole("button", { name: "SBU" });
    this.clearSbuButton = this.page.getByRole("button", { name: "Clear" });
    this.confirmSbuButton = this.page.getByRole("button", { name: "Confirm" });
    this.resetFilter = this.page.getByRole("button", { name: "Reset Filters" });
    this.selectedFilter = this.page.getByRole("button", { name: "SBU (2)" });
    this.metricDropdown = this.page.getByRole("button", {
      name: "Metric (GMV Shipped)",
    });
    this.exportMenu = this.page
      .getByTitle("Export Data Science Output")
      .locator("svg")
      .nth(1);
    this.downloadExcelBtn = this.page.getByRole("menuitem", {
      name: "Excel Export",
    });
    this.aurRadioBtn = this.page.getByLabel("AUR", { exact: true });
    this.forecastProjectionBtn = function(forecastProjectionName) {
      return this.page.locator('a').filter(
        {hasText: forecastProjectionName}
      );
    }
  }
  async applyFilters() {
    await this.page.getByLabel(testdata.sbuLabel[0]).check();
    await this.page.getByLabel(testdata.sbuLabel[1]).check();
  }
  async checkFilters() {
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
    await Utility.validateDataInGridAvailable(this.page, this.dataLoading);
    this.gridLabelTest = await this.page
      .locator(this.dataLoading)
      .first()
      .allTextContents();
    expect(this.gridLabelTest).toContain(testdata.sbu[0]);
    this.gridLabelTest = await this.page
      .locator(this.dataLoading)
      .nth(1)
      .allTextContents();
    expect(this.gridLabelTest).toContain(testdata.sbu[1]);
    expect(this.gridLabelTest).not.toContain(testdata.sbu[2]);
  }
  async selectionToSBU() {
    await this.resetFilter.click();
    await Utility.waitForLoaderToBeInvisible(this.page);
    await this.sbuButton.click();
    await this.clearSbuButton.click();
    await this.sbuButton.click();
    await this.applyFilters();
    await this.confirmSbuButton.click();
    await this.checkFilters();
  }

  async selectionSBUAndRetention() {
    await this.page.reload();
    await Utility.waitForLoaderToBeInvisible(this.page);
    await this.selectedFilter.click();
    await expect(this.page.getByLabel(testdata.sbu[0])).toBeChecked();
    await expect(this.page.getByLabel(testdata.sbu[1])).toBeChecked();
  }
  async downloadExcelWithGmvMetric() {
    await this.resetFilter.click();
    await Utility.waitForLoaderToBeInvisible(this.page);
    await this.metricDropdown.click();
    await this.aurRadioBtn.check();
    await this.exportMenu.click();
    await this.downloadExcelBtn.click();
  }

  async clickForecastProjectionTab(forecastProjectionName) {
    await this.forecastProjectionBtn(forecastProjectionName).click();
  }
}
