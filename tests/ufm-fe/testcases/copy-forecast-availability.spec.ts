import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { organizations } from '../testdata/organizations.json';

organizations.forEach(org => {
    test.describe('Copy forecast data option availability', { tag: "@Smoke @CopyForecastData @CopyScenario @Regression @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test(`Verify user can see copy forecast button in ${org.name} organisation`, { tag: "@CopyForecastData" }, async () => {
            test.setTimeout(300000);

            await test.step('Go To UFM Page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().navigate();
            })
            await test.step(`Click on ${org.name} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(org.name);
            })
            await test.step(`Click on Open ${org.lob} Forecast`, async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(org.lob);
            })
            await test.step(`Click on action button in ${org.lob} forecast`, async () => {
                await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnActionButton();
            })
            await test.step(`Verify copy forecast button is available in ${org.lob}`, async () => {
                await expect(objpageFactory.ufmPageFactory().copyForecastPage().copyForecast).toBeVisible();
            })
        })
    })
})