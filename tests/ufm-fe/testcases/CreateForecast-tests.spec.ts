import { test, expect, chromium } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import forecast from '../testdata/forecast.json'
import debug from 'debug';

test.describe('Login In @P', () => {

  test('Create Forecast @P', async ({page}) => {

    test.setTimeout(120000);
    const loginPage = new LoginPage(page);
    await loginPage.login('LB-ibg-lob-cmn');
    await page.getByText("Health & wellness").click();
    await page.getByText("Create forecast").click();
    await page.getByText('Prepare the forecast for  OPTICAL  drivers.').click();
    await page.getByText('Continue').click();
    const inputField = await page.waitForSelector('.TextField-module_input__15sq2');
    inputField.click();
    inputField.fill("demos");
    await page.getByText("Select base forecast']").click();
    await page.getByText("PRIMARY']").click();
    const createForecast = await page.waitForSelector('.Button-module_button__3Eu7g Button-module_primary__3_IxL Button-module_small__2k3yk create-btn');
    createForecast.click();
    const forecastNameElement = await page.waitForSelector('.ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value ag-cell-focus');
    const forecastName = await forecastNameElement.innerText();
    debug.log(forecastName);
    expect(forecastName).toBe(forecast.forecastName);
    debug.log(forecast.forecastName);

  });
});
 