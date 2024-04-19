import { expect, Locator, Page } from "@playwright/test";
import forecast from '../testdata/forecast.json';
import { Utility } from "../../common/fixtures/utils";

export class ScenarioStatus {

    readonly page: Page;
    readonly btnThreeDots: Locator;
    readonly forecastStatusSpinner: Locator;
    readonly finalScenarioStatus: Locator;
    readonly btnSend: Locator;
    
    constructor(page: Page) {

      this.page = page;
      this.btnThreeDots = page.locator("#basic-button");
      this.finalScenarioStatus = page.getByTestId("scenario-status");
      this.btnSend = page.locator("//button[text()='Send']");
    }
  
    async clickOnThreeDots() {

      await this.btnThreeDots.click();
    }

    async clickOnParticularSendToOrganizationReviewButton(organisationReviewButton: string){

      await this.page.getByText(`${organisationReviewButton}`).click();
    }

    async verifyForecastStatusIsSetToParticularOrganizationReview(){

      await this.btnSend.click();
      await Utility.waitForSpinnerToBeVisible(this.page);
      await Utility.waitForSpinnerToBeInvisible(this.page);
      await expect(this.finalScenarioStatus).toContainText(forecast.DataVentures.finalForecastStatus);
    }
}