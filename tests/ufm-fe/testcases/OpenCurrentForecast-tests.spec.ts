import { test } from '../../common/fixtures/test-hook';
import forecast from '../testdata/forecast.json';
import { OpenCurrentForecast } from '../pages/open-forecast.page';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";

test.describe('Verify user is able to Open Current Forecast', { tag: "@Smoke @OpenForecast" }, () => {

    test('Check if the user is able to openCurrentForecast', { tag: "@OpenForecast" }, async ({ page }) => {
        test.setTimeout(300000);
        let openCurrentForecast: OpenCurrentForecast;
        let currentForecast: CurrentForecast;

        await test.step('Verify SBA Name' + forecast.Merch.nameOfTheSBA, async () => {
            await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
            let organisationSelection: OrganisationSelection = new OrganisationSelection(page);
            currentForecast = await organisationSelection.selectOrganisation(forecast.Merch.nameOfTheSBA);
            openCurrentForecast = await currentForecast.verifySBAName(forecast.Merch.sbaBreadCrumName);
        });

        await test.step('Click on open button of the current forecast in LOB screen', async () => {
            await openCurrentForecast.clickOnOpenButton();
        });

        await test.step('Click on particular SBA breadcrum', async () => {
            await openCurrentForecast.clickOnBreadcrum(forecast.Merch.sbaBreadCrumName);
        });

        await test.step('Verify successful landing back on current forecast page', async () => {
            await openCurrentForecast.verifyCreateForecastScreenIsVisible();
        });
    });
});