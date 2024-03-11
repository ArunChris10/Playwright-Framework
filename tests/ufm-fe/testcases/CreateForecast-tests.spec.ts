import { test, expect} from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import debug from "debug";




    

test.describe('Login In @P',()=> {
    
   



test('Loginn To UFM @P', async ({page }) => {
    

    const loginPage = new LoginPage(page)
    await loginPage.login('LB-ibg-lob-cmn');

});


test('Create Forecast @P', async ({page }) => {
       
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

});
