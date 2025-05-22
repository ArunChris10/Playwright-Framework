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
  readonly selecAllSnapshotCheckbox: Locator;
  readonly selectFirstSnapshotCheckbox: Locator;
  readonly snapshotSelectedText: Locator;
  readonly selectAllLink: Locator;
  readonly clearSelectedLink: Locator;
  readonly downloadSnapshotButton: Locator;
  readonly downloadModalTitle: Locator;
  readonly downloadModalHeading: Locator;
  readonly downloadFailedMessage: Locator;
  readonly successMessageForDownload: Locator;
  readonly downloadSnapshotButtonOnModal: Locator;




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
    this.selecAllSnapshotCheckbox=page.locator('//*[@id="ag-40-input"]');
    this.selectFirstSnapshotCheckbox=page.locator('//*[@id="ag-67-input"]');
    this.snapshotSelectedText=page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/span/strong');
    this.selectAllLink=page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/button[text()="Select all"]');
    this.clearSelectedLink=page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/button[text()="Clear selected"]');
    this.snapshotSelectedText=page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/span/strong');
    this.downloadSnapshotButton=page.getByText('Download');
    this.downloadModalTitle=page.getByText('Download snapshots');
    this.downloadModalHeading=page.getByText('Download your selected snapshots as a CSV file which will be emailed when ready.');
    this.downloadFailedMessage=page.getByText('Failed to download.');
    this.successMessageForDownload=page.getByText('Snapshots exporting. This may take some time. CSV will be sent to your email when ready.');
    this.downloadSnapshotButtonOnModal=page.locator('//*[@data-testid="download-button"]');

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
  async selectSingleSnapshot() {
    await this.selectFirstSnapshotCheckbox.isVisible();
    await this.selectFirstSnapshotCheckbox.check();
    const selectedText = await this.snapshotSelectedText.innerText();
    expect(selectedText).toContain("1 selected");
  }

  async selectAllSnapshots() {
    await this.selecAllSnapshotCheckbox.isVisible();
    await this.selecAllSnapshotCheckbox.check();
    
  }

  async clickDownloadButtonAndValidateModalText() {
    await this.downloadSnapshotButton.isVisible();
    await this.downloadSnapshotButton.click();
    await this.downloadModalTitle.isVisible();
    await this.downloadModalHeading.isVisible();
    
    await this.downloadSnapshotButtonOnModal.isVisible();
    await this.downloadSnapshotButtonOnModal.click();
    const successMessage = await this.successMessageForDownload.isVisible();
    expect(successMessage).toBeTruthy();
   
  }
  

}
