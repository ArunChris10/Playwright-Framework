import { Page, expect } from "@playwright/test";

export class CurrentDemand {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "/currentdemand";


  constructor(page: Page) {
    this.page = page;
  }

  async checkEditableSummary() {
    const original = this.page;
    await this.page.getByRole('gridcell').last().click();
    await this.page.getByRole('gridcell').last().dblclick();
    await expect(original).toBe(this.page);
  }

  async verifyDSSPublished() {
    await expect(this.page.getByText('Test Automation DSS').nth(1)).toBeVisible();
  }


  async navigate() {
    await this.page.goto(this.urlEndpoint, {
      timeout: 500000,
    });
  }
}
