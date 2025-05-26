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
  readonly selectFirstDepartment: Locator;
  readonly selectFirstChannel: Locator;
  readonly channelsFilter: Locator;
  readonly departmentFilter: Locator;




  constructor(page: Page) {
    this.page = page;
    this.snapshotsForecastButton = page.getByText("Snapshot forecasts");
    this.snapshotTypeForecast = page.locator('//input[@name="FORECAST"]');
    this.snapshotTypeBudget = page.locator('//input[@name="BUDGET"]');
    this.snapshotTypeOtb = page.locator('//input[@name="OTB"]');
    this.createSnapshotsOnlyButton = page.getByText("Snapshot only");
    this.getSnapshotName = page.locator('//p[contains(@class,"Snapshot_subDescription")]//strong');
    this.createdSnapshotName = page.locator('//div[@data-testid="SnapshotList"]//div[@row-index="0"]//div[@col-id="name"]//span');
    this.successMessage = '//div[contains(text(),"forecasts are snapshotted")]';
    this.selecAllSnapshotCheckbox = page.locator('//*[@id="ag-4-input"]');
    this.selectFirstSnapshotCheckbox=page.locator('//*[@aria-rowindex="2"]//input[1][@type="checkbox"][1]');
    this.snapshotSelectedText = page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/span/strong');
    this.selectAllLink = page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/button[text()="Select all"]');
    this.clearSelectedLink = page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/button[text()="Clear selected"]');
    this.snapshotSelectedText = page.locator('//*[@data-testid="SelectionDownloadBanner"]/div/span/strong');
    this.downloadSnapshotButton = page.getByText('Download');
    this.downloadModalTitle=page.locator('//*[@id="react-aria-462"]');
    this.downloadModalHeading = page.getByText('Download your selected snapshots as a CSV file which will be emailed when ready.');
    this.downloadFailedMessage = page.getByText('Failed to download.');
    this.successMessageForDownload = page.getByText('Snapshots exporting. This may take some time. CSV will be sent to your email when ready.');
    this.downloadSnapshotButtonOnModal = page.locator('//*[@data-testid="download-button"]');
    this.selectFirstDepartment = page.locator('//*[text()="CONSUMABLES"]/preceding::input[contains(@id,"react-aria")]');
    this.selectFirstChannel = page.locator('//*[text()="Store_Core_MP"]/preceding::input[1][contains(@id,"react-aria")]');
    this.channelsFilter = page.locator('//*[text()="Select channels to include in export"]/preceding::*[@data-testid="accordionSummary"][1]//*[@role="presentation"]');
    this.departmentFilter = page.locator('//*[text()="Select departments to include in export"]/preceding::*[@data-testid="accordionSummary"]//*[@role="presentation"]');

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
  async selectSingleSnapshot() {
      await this.selectFirstSnapshotCheckbox.isVisible();
      await this.selectFirstSnapshotCheckbox.check();
      const selectedText = await this.snapshotSelectedText.innerText();
      expect(selectedText).toContain("1 selected");
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
    
  async selectAllSnapshots() {
    await expect(this.selecAllSnapshotCheckbox).toBeVisible();
    await this.selecAllSnapshotCheckbox.check();

  }

  async clickDownloadSnapshotButton() {
    await expect(this.downloadSnapshotButton).toBeVisible();
    await this.downloadSnapshotButton.click();
  }

  async downloadSnapshotAndValidateModalText() {
    await expect(this.downloadModalHeading).toBeVisible();
    await expect(this.downloadSnapshotButtonOnModal).toBeVisible();
    await this.downloadSnapshotButtonOnModal.click();
    const successMessage = await this.successMessageForDownload.isVisible();
    expect(successMessage).toBeTruthy();

  }

  async getTotalNumberOfSnapshot()
  {
    const selectedText = await this.snapshotSelectedText.innerText();
    const totalSnapshots = parseInt(selectedText.split(" ")[0], 10);
    return totalSnapshots;
  }

  async selectDepartmentFromFilter()
  {
    await expect(this.departmentFilter).toBeVisible();
    await this.departmentFilter.click();
    await this.selectFirstDepartment.click();
  }

  async selectChannelFromFilter()
  {
    await expect(this.channelsFilter).toBeVisible();
    await this.channelsFilter.click();
    await this.selectFirstChannel.click();
  }


  }
