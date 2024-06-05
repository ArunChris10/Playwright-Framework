import { test } from '../../common/fixtures/test-hook';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";
import forecast from '../testdata/forecast.json';
import { ScenarioStatus } from '../pages/scenario-status.page';

test.describe('Verify user is able to update forecast status', { tag: "@Smoke @ForecastStatus" }, () => {

    test('Check if the user is able to update forecast status', { tag: "@ForecastStatus" }, async ({ page }) => {

        test.setTimeout(480000);
        let currentForecast: CurrentForecast;
        let scenarioStatus: ScenarioStatus;

        await test.step('User clicks on the particular SBA' + forecast.DataVentures.nameOfTheSBA, async () => {

            await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
            let organisationSelection: OrganisationSelection = new OrganisationSelection(page);
            currentForecast = await organisationSelection.selectOrganisation(forecast.DataVentures.nameOfTheSBA);
            scenarioStatus = await currentForecast.isForecastStatusDraftOrChangesRequested();
        });

        await test.step('Clicks on three dots', async () => {

            await scenarioStatus.clickOnThreeDots();
        });

        await test.step('Clicks on the send to organization review button' + forecast.DataVentures.organizationReviewButton, async () => {

            await scenarioStatus.clickOnParticularSendToOrganizationReviewButton(forecast.DataVentures.organizationReviewButton);
        });

        await test.step('Verify scenario status should be set to' + forecast.DataVentures.finalForecastStatus, async () => {

            await scenarioStatus.verifyForecastStatusIsSetToParticularOrganizationReview();
        });
    })
});