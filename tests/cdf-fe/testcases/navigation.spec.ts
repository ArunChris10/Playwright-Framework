import debug from 'debug';
import { test, expect } from '../../common/fixtures/test-hook'
import { Home } from '../../common/pages/home.page';

test.describe('Navigation ',{tag: "@Smoke @Regression @ibg-centrifuge-ui"}, () => {
  test('Verify if the User is able Navigate to @DemandWorkspace', async ({ page }) => {

    await test.step('Open the hamburger menu and navigate to demand workspace', async () => {
      debug.log("Running for App : " + process.env.APP_NAME)
      test.setTimeout(300000)
      const { appBaseURL } = process.env;
      await page.goto(appBaseURL + "", { timeout: 300000 })
      const homePage: Home = new Home(page);
      await homePage.checkIfHomepageIsVisible();
      await homePage.open('Demand');
    })

    await page.getByLabel("menu").click();
    await page.getByLabel('Menu', { exact: true }).getByText('Demand').click();
    await expect(page.getByText('View Demand by')).toBeVisible();

  });
})