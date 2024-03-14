import { test, expect, chromium } from '@playwright/test';
import { LoginPage} from '../pages/login.page';
import forecast from '../testdata/forecast.json'
import debug from 'debug';
import { OrganisationSelection } from "../pages/organisation-selection.page";
import { CurrentForecast } from "../pages/current-forecast.page";
// test.describe('Login In @P', () => {

//   test('Create Forecast @P', async ({page}) => {

//     test.setTimeout(160000);
//     const loginPage = new LoginPage(page);
//     await loginPage.login('LB-ibg-lob-cmn');
//     await page.getByText("Health & wellness").click();
//     await page.getByText("Create forecast").click();
//     await page.getByText('Prepare the forecast for  OPTICAL  drivers.').click();
//     await page.getByText('Continue').click();
//     const inputField = await page.waitForSelector('.TextField-module_input__15sq2');
//     inputField.click();
//     inputField.fill("demos");
//     const selectBaseForecast = await page.waitForSelector('.Select-module_select__10Xfl');
//     await selectBaseForecast.click();
//     await page.selectOption('.Select-module_select__10Xfl', { label: 'PRIMARY' });
//     await selectBaseForecast.click();
//     const createForecast = await page.waitForSelector('.Button-module_button__3Eu7g.Button-module_primary__3_IxL.Button-module_small__2k3yk.create-btn', { state: 'visible' });
//     await createForecast.click();
//     await page.reload();
//     const forecastNameElement = await page.locator('xpath=//div[@class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 table-rows ag-row-position-absolute ag-row-first ag-row-not-inline-editing"][1]//child::div[@col-id = "name"][1]')
//     const forecastNameText = await forecastNameElement.innerText();
//     debug.log(forecastNameText);
//     expect(forecastNameText).toBe(forecast.forecastName);
    
    

test.describe('Login In @P', () => {
  


    test('Check the created Forecast', async ({ page }) => {
        
        test.step('Click on Health & wellness', async () => {
          
          await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
          await page.setViewportSize({ width: 1920, height: 1080 });
          
          let organisationSelection : OrganisationSelection = new OrganisationSelection(page);
          
          // expect(await organisationSelection.isOrganisationSelectionNavigated()).toBeTruthy();
          
          let currentForecast : CurrentForecast = await organisationSelection.selectOrganisation('Health & wellness');
          
        });
        
        test.step('Click on Create forecast', async () => {
          debug.log("oo");
          await page.waitForSelector('text=Create forecast', { state: 'visible', timeout: 160000 });
          await page.click('text=Create forecast');  
          // await page.getByText("Create forecast").click();
        });
    
        test.step('Click on Prepare the forecast for OPTICAL drivers', async () => {
          await page.getByText('Prepare the forecast for OPTICAL drivers.').click();
        });
    
        test.step('Click on Continue', async () => {
          await page.getByText('Continue').click();
        });
    
        test.step('Fill input field with "demos"', async () => {
          const inputField = await page.waitForSelector('.TextField-module_input__15sq2');
          await inputField.fill("demos");
        });
    
        test.step('Select base forecast as PRIMARY', async () => {
          const selectBaseForecast = await page.waitForSelector('.Select-module_select__10Xfl');
          await selectBaseForecast.click();
          await page.selectOption('.Select-module_select__10Xfl', { label: 'PRIMARY' });
        });
    
        test.step('Click on Create Forecast', async () => {
          const createForecast = await page.waitForSelector('.Button-module_button__3Eu7g.Button-module_primary__3_IxL.Button-module_small__2k3yk.create-btn', { state: 'visible' });
          await createForecast.click();
        });
    
        test.step('Reload the page', async () => {
          await page.reload();
        });
    
        test.step('Verify forecast name', async () => {
          const forecastNameElement = await page.locator('xpath=//div[@class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 table-rows ag-row-position-absolute ag-row-first ag-row-not-inline-editing"][1]//child::div[@col-id = "name"][1]');
          const forecastNameText = await forecastNameElement.innerText();
          debug.log(forecastNameText);
          expect(forecastNameText).toBe(forecast.forecastName);
        });
        
      });
    });


    