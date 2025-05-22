import { test } from '../../common/fixtures/test-hook';
import forecast from '../testdata/forecast.json';
import { OpenCurrentForecast } from '../pages/open-forecast.page';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";
import { PageFactory } from '../../common/pages/page-factory';
import { TIMEOUT } from '../../ssdm-fe/constants/timeout.json';
import { signinUtility } from '../../ssdm-fe/fixtures/signinUtility';

test.describe('Verify user is able to create snapshot', { tag: "@Smoke @CreateSnapshot" }, () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 300_000 });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(TIMEOUT);
        await signinUtility.SignIn(page); // Centralized sign-in before each test
        objpageFactory = new PageFactory(page);
    });
    test('Check if the user is able to openCurrentForecast', { tag: "@OpenForecast" }, async ({ page }) => {
        test.setTimeout(300000);
        let openCurrentForecast: OpenCurrentForecast;
        let currentForecast: CurrentForecast;

        await test.step('Verify SBA Name' + forecast.Merch.nameOfTheSBA, async () => {
           
            let organisationSelection: OrganisationSelection = new OrganisationSelection(page);
            currentForecast = await organisationSelection.selectOrganisation(forecast.Merch.nameOfTheSBA);
            openCurrentForecast = await currentForecast.verifySBAName(forecast.Merch.sbaBreadCrumName);
        });

        await test.step('Click on open button of the current forecast in LOB screen', async () => {
            await openCurrentForecast.clickOnOpenButton();
        });

        await test.step('Click on particular SBA breadcrum', async () => {
            await openCurrentForecast.clickOnBreadcrum(forecast.Merch.nameOfTheSBA);
        });

        await test.step('Verify successful landing back on current forecast page', async () => {
            await openCurrentForecast.verifyCreateForecastScreenIsVisible();
        });
    });
});