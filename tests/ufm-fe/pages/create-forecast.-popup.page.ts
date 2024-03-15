import { expect, Locator, Page } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import forecast from '../testdata/forecast.json'

export class CreateForecastPopup{

    readonly page: Page;
    readonly createForecastButton: Locator;
    readonly prepareTheForecastForOpticals: Locator;
    readonly continue: Locator;
    readonly inputFieldArea: Locator;
    readonly baseForecastOption: Locator;
    readonly forecastCreateFinalOption: Locator;
    readonly primaryOption: Locator;
    readonly spinner: Locator;
    readonly forecastName: Locator;
    readonly formSubmissionSpinner: Locator;

    constructor(page: Page) {

        this.page = page;
        this.createForecastButton = page.getByText('Create forecast');
        this.prepareTheForecastForOpticals = page.getByText('Prepare the forecast for OPTICAL drivers.');
        this.continue = page.getByText('Continue');
        this.inputFieldArea = page.getByPlaceholder('New OPTICAL');
        this.baseForecastOption = page.locator('select');
        this.primaryOption = page.getByText('baseForecastOption');
        this.spinner = page.locator("//span[@class='Spinner-module_container__2h3Ei Spinner-module_small__1e7K8']");
        this.forecastName = page.getByText("demos");
        this.formSubmissionSpinner = page.getByText("Form Submission is in progress");
        this.forecastCreateFinalOption = page.getByTestId("create-forecast-id");

      }

      async clickOnCreateForecast(){
         
        await this.clickOnCreateForecast();
      }
    
      async clickOnPrepareTheForecastForOpticalDrivers(){
        
        await this.prepareTheForecastForOpticals.click();
      }

      async clickOnContinueButton(){

        await this.page.getByText('Continue').click();
      }

      async fillTheInputField(){
        
        await this.inputFieldArea.fill("demos");
      }

      async selectBaseForecastPrimaryOption(){
        
        const selectBaseForecast = await this.baseForecastOption;
        await selectBaseForecast.selectOption({ label: 'PRIMARY' });
      }

      async clickOnCreateForecastFinalBUtton(){
       
        const createForecast = await this.forecastCreateFinalOption;
        await createForecast.click();
      }

      async verifyForecastHasBeenCreatedSuccessfully(){

        await this.formSubmissionSpinner;
        const forecastNameText = await this.forecastName.innerText();
        expect(forecastNameText).toBe(forecast.forecastName);
      }
}