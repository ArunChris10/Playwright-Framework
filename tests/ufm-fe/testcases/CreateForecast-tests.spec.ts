import { test, expect, chromium } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import forecast from '../testdata/forecast.json'
import debug from 'debug';

test.describe('Login In @P', () => {

  test('Create Forecast @P', async ({page}) => {

    test.setTimeout(160000);
    const loginPage = new LoginPage(page);
    await loginPage.login('LB-ibg-lob-cmn');
    await page.getByText("Health & wellness").click();
    await page.getByText("Create forecast").click();
    await page.getByText('Prepare the forecast for  OPTICAL  drivers.').click();
    await page.getByText('Continue').click();
    const inputField = await page.waitForSelector('.TextField-module_input__15sq2');
    inputField.click();
    inputField.fill("demos");
    const selectBaseForecast = await page.waitForSelector('.Select-module_select__10Xfl');
    await selectBaseForecast.click();
    await page.selectOption('.Select-module_select__10Xfl', { label: 'PRIMARY' });
    await selectBaseForecast.click();
    const createForecast = await page.waitForSelector('.Button-module_button__3Eu7g.Button-module_primary__3_IxL.Button-module_small__2k3yk.create-btn', { state: 'visible' });
    await createForecast.click();
    await page.reload();
    const forecastNameElement = await page.locator('xpath=//div[@class="ag-row-even ag-row-no-focus ag-row ag-row-level-0 table-rows ag-row-position-absolute ag-row-first ag-row-not-inline-editing"][1]//child::div[@col-id = "name"][1]')
    const forecastNameText = await forecastNameElement.innerText();
    debug.log(forecastNameText);
    expect(forecastNameText).toBe(forecast.forecastName);
    

  });
});