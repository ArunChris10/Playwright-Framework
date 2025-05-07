import { expect, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class CreateForecastPopup {

  readonly page: Page;
  readonly btncreateForecastButton: Locator;
  readonly btnContinue: Locator;
  readonly drpBaseForecastOption: Locator;
  readonly btnForecastCreateFinalOption: Locator;
  readonly spinner: Locator;
  readonly createForecastHeader: Locator
  readonly primary: Locator;

  constructor(page: Page) {

    this.page = page;
    this.btncreateForecastButton = page.getByText('Create forecast');
    this.primary = page.getByText('PRIMARY')
    this.btnContinue = page.getByText('Continue');
    this.drpBaseForecastOption = page.getByText('Select base forecast');
    this.spinner = page.locator("//span[contains(@class, 'Spinner')]");
    this.btnForecastCreateFinalOption = page.getByTestId("create-forecast-id");
    this.createForecastHeader = page.getByRole('heading', { name: 'Create forecast' })
  }

  async clickOnCreateForecast() {
    await this.clickOnCreateForecast();
  }

  async clickOnPrepareTheForecastForParticularDrivers(forecastPreparationName: string) {
    await this.page.getByText(`Prepare the forecast for ${forecastPreparationName} drivers.`).click();
  }

  async selectForecastInModal(lobName) {
    await this.page.getByText(`${lobName.toUpperCase()} forecast`).click()
  }
  async clickOnContinueButton() {
    await this.btnContinue.click();
  }

  async fillTheInputField(forecastName: string) {

    let customName = forecastName + " Automation - " + new Date().toLocaleString();

    await this.page.getByPlaceholder(`${forecastName}`).fill(customName);

    return customName
  }

  async selectBaseForecastPrimaryOption() {
    await this.drpBaseForecastOption.click()
    await this.primary.click()
  }

  async clickOnCreateForecastFinalButton() {
    await this.btnForecastCreateFinalOption.click();
  }

  async verifyForecastHasBeenCreatedSuccessfully(finalForecastCreated: string) {
    await expect(this.page.getByText(`${finalForecastCreated}`)).toBeVisible({ timeout: 300000 });
  }

  async waitforRecallForecastToComplete() {
    await this.createForecastHeader.waitFor({ state: "detached" })
  }
}