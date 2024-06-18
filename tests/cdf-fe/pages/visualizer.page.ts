import { Page, Locator, expect } from "@playwright/test";
import testdata from "../testdata/create-visualizerview.json";
import { Utility } from "../../common/fixtures/utils";

export class Visualizer {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "";
  private readonly viewNameTextField: Locator;
  private readonly createViewButton: Locator;
  private readonly searchScenarioField: Locator;
  private readonly dateRange: Locator;
  private readonly saveDateRange: Locator;
  private readonly openMoreSavedViews: Locator;
  private readonly savedViewsButton: Locator;
  private readonly saveNewView: Locator;
  private readonly visualizerName: Locator;
  private readonly settingsButton: Locator;


  constructor(page: Page) {
    this.page = page;
    this.viewNameTextField = this.page.getByPlaceholder('Write a View Name');
    this.createViewButton = this.page.getByRole('button', { name: 'Create View' });
    this.searchScenarioField = this.page.getByPlaceholder('Search');
    this.dateRange = this.page.getByTestId('date-range-component').locator('div');
    this.saveDateRange = this.page.getByRole('button', { name: 'Apply' });
    this.openMoreSavedViews = this.page.getByLabel('more');
    this.savedViewsButton = this.page.getByRole('menuitem', { name: 'Saved Views' });
    this.saveNewView = this.page.getByRole('button', { name: 'Create View' });
    this.visualizerName = this.page.locator('a').filter({ hasText: testdata.viewName });
    this.settingsButton = this.page.getByLabel('icon').nth(1);
  }

  async openCreateNewVisualizerModal() {
    await this.createViewButton.click();
  }

  async populateNewVisualizerName(name) {
    await this.viewNameTextField.click();
    await this.viewNameTextField.fill(name);
  }

  async searchForNewScenario(name) {
    await this.searchScenarioField.click();
    await this.page.getByText(name).click();
  }

  async chooseNewDateRange(dateType, startDate, endDate) {
    await this.dateRange.first().click();
    await this.page.getByLabel(dateType).check();
    await this.page.getByRole('button', { name: startDate }).click();
    await this.page.getByRole('button', { name: endDate }).click();
    await this.saveDateRange.click();
  }

  async chooseNewHierarchys(hierarchys) {
    for (let hierarchy of hierarchys) {
        await this.page.getByLabel(hierarchy).check();
    }
  }
  
  async chooseNewMetrics(metrics) {
    for (let metric of metrics) {
      await this.page.getByLabel(metric).check();
    }
  }

  async openSavedViews() {
    await this.openMoreSavedViews.click();
    await this.savedViewsButton.click();
    await Utility.waitForLoaderToBeInvisible(this.page);
  }

  async unpinSavedView(name) {
    const pinned = this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1);
    await this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1).click();
    const unpinned = this.page.getByRole('row', {name: name, exact: false}).last().getByRole('button').nth(1)
    await expect(pinned).not.toBe(unpinned);
  }

  async pinSavedView(name) {
    const unpinned = this.page.getByRole('row', {name: name, exact: false}).last().getByRole('button').nth(1);
    await this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1).click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
    const pinned = this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1)
    await expect(pinned).not.toBe(unpinned);
  }

  async saveView() {
    await this.saveNewView.first().click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
  }

  async verifyView(hierarchys) {
    await expect(await this.visualizerName.allTextContents()).toContain(testdata.viewName);
    await expect(this.page.getByRole('columnheader', { name: 'Actual' })).toBeVisible();
    for (let hierarchy of hierarchys) {
      await expect(this.page.getByRole('columnheader', { name: hierarchy })).toBeVisible();
    }
  }

  async openSettings() {
      await this.settingsButton.click();
  }
}
