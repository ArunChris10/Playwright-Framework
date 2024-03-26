import { test } from '@playwright/test';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";
import { CreateForecastPopup} from '../pages/create-forecast.-popup.page';
import forecast from '../testdata/forecast.json'
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";

test.describe('Create Forecast Feature Test @createForecast', () => {
  test.beforeAll(async ({request}) => { await UfmUtility.deleteForecast(forecast.scenario_id,request)});

    test('Check if the user is able to @createForecast', async ({ page }) => {
      test.setTimeout(300000);
      
      let currentForecast : CurrentForecast ;   
      let currentForecastPopup : CreateForecastPopup ;
        
        await test.step('Click on the particular SBA' + forecast.sbaName, async () => {
          
          await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
          await page.setViewportSize({ width: 1920, height: 1080 });
          let organisationSelection : OrganisationSelection = new OrganisationSelection(page);
          currentForecast = await organisationSelection.selectOrganisation(forecast.sbaName);  
          
        });
        
        await test.step('Click on Create forecast', async () => {
          currentForecastPopup =  await currentForecast.clickOnCreateForecast();
          
        });
    
        await test.step('Click on Prepare the forecast for Particular drivers', async () => {
          
          await currentForecastPopup.clickOnPrepareTheForecastForParticularDrivers(forecast.forecastPreparationName);
          
        });
    
        await test.step('Click on Continue', async () => {
         
          await currentForecastPopup.clickOnContinueButton();
        });
    
        await test.step('Fill input field with forecast name' + forecast.forecastName, async () => {
          await currentForecastPopup.fillTheInputField(forecast.nameOfTheForecastInCreateForecastWindow);
         
        });
    
        await test.step('Select base forecast', async () => {
          
          await currentForecastPopup.selectBaseForecastPrimaryOption(forecast.baseForecastName);
        });
    
        await test.step('Click on Create Forecast', async () => {
          
          await currentForecastPopup.clickOnCreateForecastFinalButton();
          
        });
    
        await test.step('Verify forecast name', async () => {
          
          await currentForecastPopup.verifyForecastHasBeenCreatedSuccessfully(forecast.forecastName);
        });
      });
    }); 