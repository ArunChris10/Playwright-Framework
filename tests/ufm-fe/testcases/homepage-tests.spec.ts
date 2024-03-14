import { test, expect } from '@playwright/test';
import { CurrentForecast } from '../pages/current-forecast.page';
import { LoginPage } from '../pages/login.page';
import { OrganisationSelection } from '../pages/organisation-selection.page';


test('login @regression @login', async ({page }) => {
 
  const { token,ufmAppBaseURL} = process.env;
  test.setTimeout(120000);
  await page.goto(ufmAppBaseURL+"/page-with-no-auth");
  
  
  await page.evaluate(() => localStorage.setItem('isAutomationTestRunning',JSON.stringify(true)));

  const url = ufmAppBaseURL + "/?token=" + token;
  await page.goto(url)
  await page.getByLabel("menu").click();
  await page.getByText('My Homepage').click();
  await page.getByLabel('menu').click();
  await expect(page.getByText('Unified Financial Model', { exact: true })).toBeVisible();

});

test('login using @credentials @Regression',async( { page } ) => {
  test.setTimeout(120000);
    const loginPage = new LoginPage(page)
    await loginPage.login('LB-ibg-lob-cmn');
})

test('Validate the @breadcrum navigation',async ({page}) => {
  await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
  let organisationSelection : OrganisationSelection = new OrganisationSelection(page);
  expect(await organisationSelection.isOrganisationSelectionNavigated()).toBeTruthy();
  let currentForecast : CurrentForecast = await organisationSelection.selectOrganisation('Merchandising');
  organisationSelection=await currentForecast.gotoOrganisationSelection();
  expect(await organisationSelection.isOrganisationSelectionNavigated()).toBeTruthy();
  

})


