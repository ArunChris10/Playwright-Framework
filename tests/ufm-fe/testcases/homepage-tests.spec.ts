import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';


  test('login @regression @login', async ({ page }) => {
 
    const { token,appBaseURL} = process.env;
    test.setTimeout(100000);
    await page.goto(appBaseURL+"/page-with-no-auth");
    
    await page.evaluate(() => localStorage.setItem('isAutomationTestRunning',JSON.stringify(true)));
  
    const url = appBaseURL + "/?token=" + token;
    await page.goto(url)
    await page.getByLabel("menu").click();
    await page.getByText('My Homepage').click();
    await page.getByLabel('menu').click();
    await expect(page.getByText('Unified Financial Model', { exact: true })).toBeVisible();
    
  
  });
 
  test('login using @credentials @Regression',async( { page } ) => {
    const loginPage = new LoginPage(page)
    await loginPage.login('LB-ibg-lob-cmn');
})