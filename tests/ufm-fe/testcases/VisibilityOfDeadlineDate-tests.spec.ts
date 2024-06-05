import { test } from '../../common/fixtures/test-hook';
import forecast from '../testdata/forecast.json';
import { CurrentForecast } from "../pages/current-forecast.page";
import { OrganisationSelection } from "../pages/organisation-selection.page";

test.describe('Visibility Of Deadline Date', { tag: "@Smoke @seeDeadlineDate" }, () => {

    test('Check if the user is able to see Deadline Date', { tag: "@Smoke @seeDeadlineDate" }, async ({ page }) => {
        test.setTimeout(300000);
        let currentForecast: CurrentForecast;

        await test.step('User Is Navigated To Any SBA Forecast Page' + forecast.Merch.nameOfTheSBA, async () => {

            await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
            let organisationSelection: OrganisationSelection = new OrganisationSelection(page);
            currentForecast = await organisationSelection.selectOrganisation(forecast.Merch.nameOfTheSBA);
        });

        await test.step('Verify User should see the deadline Date for the forecast', async () => {
            await currentForecast.verifyVisibilityOfDeadlineDate();
        });
    });
});