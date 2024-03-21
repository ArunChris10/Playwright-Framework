import debug from 'debug';
import { test, expect } from '../../common/fixtures/test-hook'
import { Home } from '../../common/pages/home.page';




test.describe('Navigation @Smoke',()=>{
  test('Verify if the User is able Navigate to Demand Workspace', async ({page }) => {
  
    await test.step('Open the hamburger menu and navigate to demand workspace', async () => {
      debug.log("Running for App : "+process.env.APP_NAME)
      test.setTimeout(120000)
      const {appBaseURL} = process.env;
      await page.goto(appBaseURL+"")
      const homePage : Home = new Home(page);
      await homePage.checkIfHomepageIsVisible(); 
      await homePage.open('Demand Workspace');
    })


    await page.getByLabel("menu").click();
    await page.getByLabel('Menu', { exact: true }).getByText('Demand Workspace').click();
    await expect(page.getByText('View Demand Workspace by')).toBeVisible();
  
  });
})