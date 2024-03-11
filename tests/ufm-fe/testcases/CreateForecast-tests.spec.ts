import { test, expect} from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { chromium } from 'playwright';


export class B{
    


static async loggingsIn(){
test('Login In @Filterss', async ({page }) => {
    // const aa = new LoginPage(page)
    // await aa.login(page);
    // await A.loggingIn();

    // AA.loginnn(page);

  
    const { token,appBaseURL} = process.env;
    test.setTimeout(120000);
    page.waitForTimeout(1000);
    const aa = page.goto(appBaseURL+"/page-with-no-auth");
   
    page.evaluate(() => {
    localStorage.setItem('isAutomationTestRunning', JSON.stringify(true));

    const url = appBaseURL + "/?token=" + token;
    
    page.goto(url)
    page.getByLabel("menu").click();
    page.getByText('My Homepage').click();
    page.getByLabel('menu').click();
    expect(page.getByText('Unified Financial Model', { exact: true })).toBeVisible();
   
});
});

}


static async rr(){
test('Loginn To UFM @Filterss', async ({page }) => {
    // await A.loginUsingCredentials('LB-ibg-lob-opt');
    
    // AA.loginUsing('LB-ibg-lob-cmn');

    const loginPage = new LoginPage(page)
    loginPage.login('LB-ibg-lob-cmn');

});
}

static async createForecast(){
    test('Create Forecast @demo', async ({page }) => {
        await page.getByText("Create forecast']").click();
        const selectElement = await page.waitForSelector('.GridColumn-module_gridColumn__2lqsw GridColumn-module_small12__2mzOm lobs-container');
        selectElement.click();
        await page.getByText("Continue").click;
        const inputField = await page.waitForSelector('.TextField-module_input__15sq2');
        inputField.click();
        inputField.fill("demos");
        await page.getByText("Select base forecast']").click();
        await page.getByText("PRIMARY']").click();  
        const createForecast = await page.waitForSelector('.Button-module_button__3Eu7g Button-module_primary__3_IxL Button-module_small__2k3yk create-btn');
        createForecast.click();
      
      
});

}


}
