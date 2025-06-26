import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { SBAorganization, BAorganization } from '../testdata/organizations.json';

test.describe('Test when Copy Forecast Data option is not available', { tag: "@Smoke @NoCopyForecastData" }, () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    })
    test(`Verify user can not see copy forecast button in Data Science`, { tag: "@NoCopyForecastDataScience" }, async () => {
        test.setTimeout(300000);

        await test.step('Navigate to Data Science', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        });

        await test.step(`Verify action button is not visible in Data Science`, async () => {
            await expect(objpageFactory.ufmPageFactory().openCurrentForecast().actionButton).not.toBeVisible();
        });
    });

    test(`Verify user can not see copy forecast button in AOP`, { tag: "@NoCopyForecastAOP" }, async () => {
        test.setTimeout(300000);

        await test.step('Navigate to Data Science', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        });
        
        await test.step('Navigate to AOP', async () => {
            await objpageFactory.ufmPageFactory().dataScienceReviewPage().navigateToAOP();
        });
        await test.step(`Verify action button is not visible in AOP`, async () => {
            await expect(objpageFactory.ufmPageFactory().openCurrentForecast().actionButton).not.toBeVisible();
        })
    })
    test(`Verify user can not see copy forecast button in SBA review`, { tag: "@NoCopyForecastSBAReview" }, async ({ page }) => {
        test.setTimeout(300000);

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on ${SBAorganization[0].name} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(SBAorganization[0].name);
            await page.waitForTimeout(5000);
        })
        await test.step('Click the first Open button under Line of business progress', async () => {
            const openButton = objpageFactory.ufmPageFactory().openCurrentForecast().ReviewOpen.first();
            await openButton.click();
        });
        await test.step('Click the first Open button under Line of business progress', async () => {
            await page.waitForTimeout(5000);
            objpageFactory.ufmPageFactory().openCurrentForecast().driverExplorationTab.click();
            await page.waitForTimeout(5000);
            await expect(objpageFactory.ufmPageFactory().openCurrentForecast().actionButton).not.toBeVisible();
        });
    })
    test(`Verify user can not see copy forecast button in BA review`, { tag: "@NoCopyForecastBAReview" }, async ({ page }) => {
        test.setTimeout(500000);

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on ${BAorganization[0].name} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(BAorganization[0].name);
            await page.waitForTimeout(5000);
        })
        await test.step('Click the first Open button under Line of business progress', async () => {
            const openButton = objpageFactory.ufmPageFactory().openCurrentForecast().ReviewOpen.first();
            await openButton.click();
        });
        await test.step('Click the first Open button under Line of business progress', async () => {
            await page.waitForTimeout(10000);
            objpageFactory.ufmPageFactory().openCurrentForecast().driverExplorationTab.click();
            await page.waitForTimeout(3000);
            await expect(objpageFactory.ufmPageFactory().openCurrentForecast().actionButton).not.toBeVisible();
        });
    })
})