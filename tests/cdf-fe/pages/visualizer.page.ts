import { Page, expect } from "@playwright/test";
import testdata from "../testdata/create-visualizerview.json";
import { Utility } from "../../common/fixtures/utils";

export class Visualizer {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "";


  constructor(page: Page) {
    this.page = page;
  }

  async openCreateNewVisualizerModal() {
    await this.page.getByRole('button', { name: 'Create View' }).click();
  }

  async populateNewVisualizerName(name) {
    await this.page.getByPlaceholder('Write a View Name').click();
    await this.page.getByPlaceholder('Write a View Name').fill(name);
  }

  async searchForNewScenario(name) {
    await this.page.getByPlaceholder('Search').click();
    await this.page.getByText(name).click();
  }

  async chooseNewDateRange(dateType, startDate, endDate) {
    await this.page.getByTestId('date-range-component').locator('div').first().click();
    await this.page.getByLabel(dateType).check();
    await this.page.getByRole('button', { name: startDate }).click();
    await this.page.getByRole('button', { name: endDate }).click();
    await this.page.getByRole('button', { name: 'Apply' }).click();
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
    await this.page.getByLabel('more').click();
    await this.page.getByRole('menuitem', { name: 'Saved Views' }).click();
    await Utility.waitForLoaderToBeInvisible(this.page);
  }

  async unpinSavedView(name) {
    const pinned = this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1);
    await this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1).click();
    const unpinned = this.page.getByRole('row', {name: name, exact: false}).last().getByRole('button').nth(1)
    await expect(pinned).not.toBe(unpinned);
    await this.page.waitForTimeout(5000);
  }

  async pinSavedView(name) {
    const unpinned = this.page.getByRole('row', {name: name, exact: false}).last().getByRole('button').nth(1);
    await this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1).click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
    const pinned = this.page.getByRole('row', {name: name, exact: false}).first().getByRole('button').nth(1)
    await expect(pinned).not.toBe(unpinned);
  }

  async saveView() {
    await this.page.getByRole('button', { name: 'Create View' }).first().click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
  }

  async verifyView(hierarchys) {
    await expect(await this.page.locator('a').filter({ hasText: testdata.viewName }).allTextContents()).toContain(testdata.viewName);
    await expect(this.page.getByRole('columnheader', { name: 'Actual' })).toBeVisible();
    for (let hierarchy of hierarchys) {
      await expect(this.page.getByRole('columnheader', { name: hierarchy })).toBeVisible();
    }
  }

  async openSettings() {
      await this.page.getByLabel('icon').nth(1).click();
  }

  async navigate() {
    await this.page.goto(this.urlEndpoint, {
      timeout: 500000,
    });
  }
}
