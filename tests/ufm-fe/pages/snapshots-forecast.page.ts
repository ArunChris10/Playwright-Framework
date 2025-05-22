import { expect, Locator, Page } from "@playwright/test";

export class SnapshotsForecast {
  readonly expectedSnapshotName: string;
  readonly page: Page;
  readonly sendingForReview: Locator;
  readonly snapshotsForecastButton: Locator;
  readonly createForecastButton: Locator;
  readonly snapshotTypeForecast: Locator;
  readonly snapshotTypeBudget: Locator;
  readonly snapshotTypeOtb: Locator;
  readonly createSnapshotsOnlyButton: Locator;
  readonly createdSnapshotType: Locator;
  readonly createdSnapshotTimeStamp: Locator;
  readonly getSnapshotName: Locator;
  readonly createdSnapshotName: Locator;
  readonly successMessage: string;
  
  constructor(page: Page) {
    this.page = page;
    this.snapshotsForecastButton = page.getByText("Snapshot forecasts");
    this.snapshotTypeForecast = page.locator('//input[@name="FORECAST"]');
    this.snapshotTypeBudget = page.locator('//input[@name="BUDGET"]');
    this.snapshotTypeOtb = page.locator('//input[@name="OTB"]');
    this.createSnapshotsOnlyButton = page.getByText("Snapshot only");
    this.getSnapshotName = page.locator('//p[contains(@class,"Snapshot_subDescription")]//strong');
    this.createdSnapshotName = page.locator('//div[@data-testid="SnapshotList"]//div[@row-index="0"]//div[@col-id="name"]//span');
    this.successMessage =  '//div[contains(text(),"forecasts are snapshotted")]';
  }
  
  async currentDateTimeStamp() {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const currentDate = new Date();
    return currentDate.toLocaleString("en-US", options);
  }

  async clickSnapshotsForecastButton() {
    await this.snapshotsForecastButton.isVisible();
    await this.snapshotsForecastButton.click();
  }

  async getSnapshotNameInDialog(){
    return this.getSnapshotName.innerText();
  }

  async clickSnapshotType(snapshotType: string) {
    switch (snapshotType) {
      case "Forecast":
      await this.snapshotTypeForecast.click();
      break;
      case "Budget":
      await this.snapshotTypeBudget.click();
      break;
      case "OTB":
      await this.snapshotTypeOtb.click();
      break;
      default:
      throw new Error(`Invalid snapshot type: ${snapshotType}`);
    }
  }

  async clickCreateSnapshotsOnlyButton() {
    await this.createSnapshotsOnlyButton.isVisible();
    await this.createSnapshotsOnlyButton.click();
    await this.page.waitForSelector(this.successMessage);
    await this.page.waitForTimeout(5000);
  }

  async verifySnapshotNameCreated(expectedSnapshotName: string) {
    const snapshotName = await this.createdSnapshotName.innerText();
    expect(snapshotName.toLowerCase()).toContain(expectedSnapshotName.toLowerCase());
  }

  async verifySnapshotTimeStampCreated(snapshotType: string) {
    const snapshotTypeLocator = this.page.locator(`(//div[@data-testid="SnapshotList"]//div[contains(text(),"${snapshotType}")])[1]/following-sibling::div[2]`);
    const snapshotTimeStamp = await snapshotTypeLocator.innerText();
    const currentTime = new Date(await this.currentDateTimeStamp());
    const snapshotTime = new Date(snapshotTimeStamp);
    const timeDifference = Math.abs(currentTime.getTime() - snapshotTime.getTime());
    const oneMinuteInMilliseconds = 60 * 1000;
    expect(timeDifference).toBeLessThanOrEqual(oneMinuteInMilliseconds);
  }
}
