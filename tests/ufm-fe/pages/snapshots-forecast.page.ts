import { expect, Locator, Page } from "@playwright/test";

export class SnapshotsForecast {
  readonly page: Page;
  readonly sendingForReview: Locator;
  readonly snapshotsForecastButton: Locator;
  readonly createForecastButton: Locator;
  readonly snapshotTypeForecast: Locator;
  readonly snapshotTypeBudget: Locator;
  readonly snapshotTypeOtb: Locator;
  readonly createSnapshotsOnlyButton: Locator;
  readonly createdSnapshotType: Locator;
  readonly getSnapshotName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.snapshotsForecastButton = page.getByText("Snapshot forecasts");
    this.snapshotTypeForecast = page.getByText("Create forecast");
    this.snapshotTypeBudget = page.getByText("Create forecast");
    this.snapshotTypeOtb = page.getByText("Create forecast");
    this.createSnapshotsOnlyButton = page.getByText("Snapshot only");
    this.createdSnapshotType = page.locator(
      '//div[@data-testid="SnapshotList"]//div[@row-index="0"]//div[@col-id="type"]'
    );
    this.getSnapshotName = page.locator('//p[contains(@class,"Snapshot_subDescription")]//strong');
  }

  async clickSnapshotsForecastButton() {
    await this.snapshotsForecastButton.isVisible();
    await this.snapshotsForecastButton.click();
  }

  async clickSnapshotTypeForecast() {
    await this.snapshotTypeForecast.isVisible();
    await this.snapshotTypeForecast.click();
  }

  async clickSnapshotTypeBudget() {
    await this.snapshotTypeBudget.isVisible();
    await this.snapshotTypeBudget.click();
  }

  async clickSnapshotTypeOtb() {
    await this.snapshotTypeOtb.isVisible();
    await this.snapshotTypeOtb.click();
  }

  async clickCreateSnapshotsOnlyButton() {
    await this.createSnapshotsOnlyButton.isVisible();
    await this.createSnapshotsOnlyButton.click();
  }

  async verifySnapshotTypeCreated() {
    await this.createdSnapshotType.isVisible();
    const snapshotType = await this.createdSnapshotType.innerText();
    expect(snapshotType).toContain("Forecast");
  }

  

}
