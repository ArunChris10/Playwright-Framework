import { test } from '@playwright/test';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";
import { CreateForecastPopup } from '../pages/create-forecast.-popup.page';
import forecastdata from '../testdata/forecast.json'
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";

test.describe('Create Forecast Feature Test', { tag: "@Smoke @createForecast" }, () => {

  const forecast = "Fulfillment";
  const lob = forecastdata[forecast];

  test.beforeAll(async ({ request }) => { await UfmUtility.deleteForecast(lob.scenario_id, lob.dim_id, lob.dim_val_id, request) });

  test('Check if the user is able to createForecast', { tag: "@createForecast" }, async ({ page }) => {
    test.setTimeout(480000);

    let currentForecast: CurrentForecast;
    let currentForecastPopup: CreateForecastPopup;

    await test.step('Click on the particular BA' + lob.nameOfTheSBA, async () => {

      await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
      await page.setViewportSize({ width: 1920, height: 1080 });
      let organisationSelection: OrganisationSelection = new OrganisationSelection(page);
      currentForecast = await organisationSelection.selectOrganisation(lob.nameOfTheSBA);

    });

    await test.step('Click on Create forecast', async () => {
      currentForecastPopup = await currentForecast.clickOnCreateForecast();

    });

    await test.step('Click on Prepare the forecast for Particular drivers', async () => {

      await currentForecastPopup.clickOnPrepareTheForecastForParticularDrivers(lob.forecastPreparationName);

    });

    await test.step('Click on Continue', async () => {

      await currentForecastPopup.clickOnContinueButton();
    });

    await test.step('Fill input field with forecast name' + lob.nameOfTheForecastInCreateForecastWindow, async () => {
      await currentForecastPopup.fillTheInputField(lob.nameOfTheForecastInCreateForecastWindow);

    });

    await test.step('Select base forecast', async () => {

      await currentForecastPopup.selectBaseForecastPrimaryOption(lob.baseForecastName);
    });

    await test.step('Click on Create Forecast', async () => {

      await currentForecastPopup.clickOnCreateForecastFinalButton();

    });

    await test.step('Verify forecast name', async () => {

      await currentForecastPopup.verifyForecastHasBeenCreatedSuccessfully(lob.forecastName);
    });
  });
}); 