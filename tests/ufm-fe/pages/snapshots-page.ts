import { expect, Locator, Page } from "@playwright/test";
import forecast from "../testdata/forecast.json";
import debug from "debug";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../../ufm-be/testdata/deadlinedate-api.json";

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
  }

  async clickSnapshotsForecastButton() {
    await this.snapshotsForecastButton.isVisible();
    await this.snapshotsForecastButton.click();
  }

  async clickSnapshotTypeForecast() {
    const snapshotType = this.snapshotTypeForecast;
    await snapshotType.isVisible();
    await this.snapshotTypeForecast.click();
  }

  

}