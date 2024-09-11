import { Page, Locator, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import { test } from "../../common/fixtures/test-hook";

export class CurrentDemand {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "/currentdemand";
  private readonly demandOutputCard: Locator;
  private readonly selectDemandHeading: Locator;
  private readonly selectDemandButton: Locator;
  private readonly selectDemandOptions: Locator;
  private readonly gridCell: Locator;
  private readonly body: Locator;

  // View-specific Elements
  private readonly editVisualizerDataIcon: Locator;
  private readonly visualizerCopyIcon: Locator;
  private readonly deleteViewButton: Locator;
  private readonly confirmDeleteViewButton: Locator;

  private readonly PUBLISHED_DATE_REGEX = /Published: \w{3} \d{2}, \d{4}, (?:\d|\d{2}):\d{2} (?:am|pm)/i
  private readonly DEMAND_OUTPUT_CARD_SELECTOR = 'div[class*="Card-module_card__"]'

  constructor(page: Page) {
    this.page = page;
    this.demandOutputCard = this.page.locator(this.DEMAND_OUTPUT_CARD_SELECTOR)
    this.selectDemandHeading = this.page.getByRole('heading', { name: 'Choose a Demand output'})
    this.selectDemandButton = this.page.getByRole('button', { name: 'Choose a Demand output to view'})
    this.selectDemandOptions = this.page.getByRole('option').filter({ hasText: 'Published:'})
    this.gridCell = this.page.getByRole('gridcell');
    this.body = this.page.locator('a');
    this.editVisualizerDataIcon = this.page.locator('[test-data="editVisualizerData"]')
    this.visualizerCopyIcon = this.page.getByTestId('ContentCopyIcon')
    this.deleteViewButton = this.page.getByRole('button', { name: 'Delete View' })
    this.confirmDeleteViewButton = this.page.getByRole('button', { name: 'Yes, Delete' })
  }

  async switchToFirstDemandStackScenario() {
    await this.selectDemandButton.click();
    await this.selectDemandOptions.first().click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page)
  }

  async checkEditableSummary() {
    const original = this.page;
    await this.gridCell.last().click();
    await this.gridCell.last().dblclick();
    await expect(original).toBe(this.page);
  }

  async verifyHasChooseDemandHeader() {
    await expect(this.selectDemandHeading).toBeVisible();
  }

  async verifyOptionsHaveDates() {
    for (const selectDemandOption of await this.selectDemandOptions.all()) {
      await expect(selectDemandOption.getByText(this.PUBLISHED_DATE_REGEX)).toBeVisible();
    }
  }

  async verifyDemandOutputHasDate() {
    await expect(this.demandOutputCard.getByText(this.PUBLISHED_DATE_REGEX)).toBeVisible();
  }

  async verifyDSSPublished(name) {
    await this.selectDemandButton.click()
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async verifyVisualizerViewPublished(name) {
    await this.body.filter({ hasText: name }).first().click();
    await expect(this.body.filter({ hasText: name }).first()).toBeVisible();
  }

  async switchToVisualizerTab(name: string) {
    await this.page.getByText(name.slice(0, 20)).first().click()
  }

  async verifyCopyIconIsHidden() {
    await Utility.waitForSpinnerToBeInvisible(this.page)
    await expect(this.visualizerCopyIcon).toBeHidden()
  }

  async deleteView() {
    await this.editVisualizerDataIcon.click();
    await this.deleteViewButton.click();
    await this.confirmDeleteViewButton.click();
  }

  async navigate() {
    await this.page.goto(this.urlEndpoint, {
      timeout: 500000,
    });
  }

  async switchToVisualizerAndAssertCopyDoesNotExist(name: string) {
    await test.step("Navigate to Current Demand page", async () => {
      await this.navigate();
    })

    await test.step("Switch to the respective visualizer tab", async () => {
      await this.switchToVisualizerTab(name)
    })

    await test.step("Verify that the copy option is not visible", async () => {
      await this.verifyCopyIconIsHidden()
    })
  }
}
