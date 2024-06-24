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
  private readonly addCustomScenarioButton: Locator;
  private readonly customScenarioNameTextField: Locator;
  private readonly addCalculationButton: Locator;
  private readonly addCustomMetricButton: Locator;
  private readonly customMetricNameTextField: Locator;
  private readonly pauseRefreshToggle: Locator;
  private readonly noRows: Locator;
  private readonly gridcell: Locator;


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
    this.addCustomScenarioButton = this.page.getByRole('button', { name: 'Add new scenario' });
    this.customScenarioNameTextField = this.page.getByPlaceholder('Enter new scenario name');
    this.addCalculationButton = this.page.getByRole('button', { name: 'Add calculation' });
    this.addCustomMetricButton = this.page.getByRole('button', {name: 'Add new metric'});
    this.customMetricNameTextField = this.page.getByPlaceholder('Enter new metric name');
    this.pauseRefreshToggle = this.page.getByRole('switch', { name: 'Pause refresh' })
    this.noRows = this.page.getByText("No Rows To Show");
    this.gridCell = this.page.getByRole('gridcell', {name : '$', exact:false});
  }

  async openCreateNewVisualizerModal() {
    await this.createViewButton.click();
  }

  async populateNewVisualizerName(name) {
    await this.viewNameTextField.click();
    await this.viewNameTextField.fill(name);
  }

  async searchForNewScenario(name) {
    await this.searchScenarioField.first().click();
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

  async createScenario(customScenarioName, customScenariosCreatedFrom, customScenarioOperation) {
      await this.addCustomScenarioButton.click();
      await this.customScenarioNameTextField.fill(customScenarioName);
      await this.page.getByRole('button', { name: customScenarioOperation }).click();
      for (let scenario of customScenariosCreatedFrom) {
        await this.page.getByLabel(scenario).check();
      }
      await this.addCalculationButton.click();
  }

  async verifyCustomScenarioView(scenarioNames, operation) {
    let operationNum = -1;
    if (operation === 'sum') {
      operationNum = parseInt(await this.gridCell.nth(1).innerText()) + parseInt(await this.gridCell.nth(2).innerText());
    }
    if (operation === 'difference') {
      operationNum = parseInt(await this.gridCell.nth(1).innerText()) - parseInt(await this.gridCell.nth(2).innerText());
    }
    const value = parseInt(await this.gridCell.nth(3).innerText());
    await expect(value).toBe(operationNum);
  }

  async createMetric(customMetricName, customMetricCreatedFrom, customMetricOperation) {
      await this.addCustomMetricButton.click();
      await this.customMetricNameTextField.fill(customMetricName);
      await this.page.getByRole('button', { name: customMetricOperation }).click();
      for (let metric of customMetricCreatedFrom) {
        await this.page.getByLabel(metric).check();
      }
      await this.addCalculationButton.click();
  }

  async verifyCustomMetric(metricName, operation) {
    await expect(this.page.getByText(metricName).first()).toBeVisible();
    let operationNum = -1;
    if (operation === 'sum') {
      operationNum = parseInt(await this.gridCell.nth(1).innerText()) + parseInt(await this.gridCell.nth(2).innerText());
    }
    if (operation === 'difference') {
      operationNum = parseInt(await this.gridCell.nth(1).innerText()) - parseInt(await this.gridCell.nth(2).innerText());
    }
    const value = parseInt(await this.gridCell.nth(3).innerText());
    await expect(operationNum).toBe(value);
  }

  async pauseRefreshToggleButton() {
    await this.pauseRefreshToggle.click();
  }

  async temporaryPauseRefreshCheck() {
    await expect(this.noRows.first()).toBeVisible();
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
