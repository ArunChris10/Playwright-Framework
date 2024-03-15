import { test, expect, chromium } from '@playwright/test';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";
import { CreateForecastPopup} from '../pages/create-forecast.-popup.page';
  

test.describe('Login In @P', () => {
 
    test('Check the created Forecast @createForecastTest', async ({ page }) => {
      
      let currentForecast : CurrentForecast ;   
      let currentForecastPopup : CreateForecastPopup ;
        
        await test.step('Click on Health & wellness', async () => {
          
          await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
          await page.setViewportSize({ width: 1920, height: 1080 });
          let organisationSelection : OrganisationSelection = new OrganisationSelection(page);
          currentForecast = await organisationSelection.selectOrganisation('Health & wellness');  
          
        });
        
        await test.step('Click on Create forecast', async () => {
          currentForecastPopup =  await currentForecast.clickOnCreateForecast();
          
        });
    
        await test.step('Click on Prepare the forecast for OPTICAL drivers', async () => {
          
          await currentForecastPopup.clickOnPrepareTheForecastForOpticalDrivers();
          
        });
    
        await test.step('Click on Continue', async () => {
         
          await currentForecastPopup.clickOnContinueButton();
        });
    
        await test.step('Fill input field with "demos"', async () => {
          await currentForecastPopup.fillTheInputField();
         
        });
    
        await test.step('Select base forecast as PRIMARY', async () => {
          
          await currentForecastPopup.selectBaseForecastPrimaryOption();
        });
    
        await test.step('Click on Create Forecast', async () => {
          
          await currentForecastPopup.clickOnCreateForecastFinalBUtton();
        });
    
        await test.step('Verify forecast name', async () => {
          
          await currentForecastPopup.verifyForecastHasBeenCreatedSuccessfully();
        });
        
      });
    }); 