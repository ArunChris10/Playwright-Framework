import { Page, Locator, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class CurrentDemand {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "/currentdemand";
  private readonly demandOutputCard: Locator;
  private readonly selectDemandHeading: Locator;
  private readonly selectDemandButton: Locator;
  private readonly selectDemandOptions: Locator;
  private readonly gridCell: Locator;
  private readonly body: Locator;

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

  async navigate() {
    await this.page.goto(this.urlEndpoint, {
      timeout: 500000,
    });
  }
}
