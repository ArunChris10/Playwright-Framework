import { expect, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class CreateForecastPopup {

  readonly page: Page;
  readonly btncreateForecastButton: Locator;
  readonly btnContinue: Locator;
  readonly drpBaseForecastOption: Locator;
  readonly btnForecastCreateFinalOption: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {

    this.page = page;
    this.btncreateForecastButton = page.getByText('Create forecast');
    this.btnContinue = page.getByText('Continue');
    this.drpBaseForecastOption = page.locator('select');
    this.spinner = page.locator("//span[contains(@class, 'Spinner')]");
    this.btnForecastCreateFinalOption = page.getByTestId("create-forecast-id");
  }

  async clickOnCreateForecast() {

    await this.clickOnCreateForecast();
  }

  async clickOnPrepareTheForecastForParticularDrivers(forecastPreparationName: string) {
    await this.page.getByText(`Prepare the forecast for ${forecastPreparationName} drivers.`).click();
  }

  async clickOnContinueButton() {

    await this.btnContinue.click();
  }

  async fillTheInputField(forecastName: string) {

    await this.page.getByPlaceholder(`${forecastName}`).fill(forecastName);
  }

  async selectBaseForecastPrimaryOption(baseForecastsPrimary: string) {

    await this.drpBaseForecastOption.selectOption({ label: baseForecastsPrimary });

  }

  async clickOnCreateForecastFinalButton() {

    await this.btnForecastCreateFinalOption.click();

  }

  async verifyForecastHasBeenCreatedSuccessfully(finalForecastCreated: string) {

    await Utility.waitForSpinnerToBeVisible(this.page);
    await Utility.waitForSpinnerToBeInvisible(this.page);
    await expect(this.page.getByText(`${finalForecastCreated}`)).toBeVisible();

  }
}