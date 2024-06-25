import { Page, Locator, expect } from "@playwright/test";

export class CurrentDemand {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "/currentdemand";
  private readonly gridCell: Locator;
  private readonly body: Locator;


  constructor(page: Page) {
    this.page = page;
    this.gridCell = this.page.getByRole('gridcell');
    this.body = this.page.locator('a');
  }

  async checkEditableSummary() {
    const original = this.page;
    await this.gridCell.last().click();
    await this.gridCell.last().dblclick();
    await expect(original).toBe(this.page);
  }

  async verifyDSSPublished(name) {
    await expect(this.page.getByText(name).nth(1)).toBeVisible();
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
