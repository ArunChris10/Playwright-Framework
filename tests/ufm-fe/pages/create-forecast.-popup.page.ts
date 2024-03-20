import { expect, Locator, Page } from "@playwright/test";

import forecast from '../testdata/forecast.json'



export class CreateForecastPopup{

    readonly page: Page;
    readonly createForecastButton: Locator;
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
        this.continue = page.getByText('Continue');
        this.inputFieldArea = page.locator("//input[@id = 'react-aria-27']");
        this.baseForecastOption = page.locator('select');
        this.spinner = page.locator("//span[contains(@class, 'Spinner')]");
        // this.formSubmissionSpinner = page.getByText("Form Submission is in progress"); 
        this.forecastCreateFinalOption = page.getByTestId("create-forecast-id");
        this.forecastName = page.getByText("OpticalForecast");
      }

      async clickOnCreateForecast(){
         
        await this.clickOnCreateForecast();
      }
    
      async clickOnPrepareTheForecastForParticularDrivers(forecastPreparationName: string) {
        await this.page.getByText(`Prepare the forecast for ${forecastPreparationName} drivers.`).click();
      }

      async clickOnContinueButton(){

        await this.continue.click();
      }

      async fillTheInputField(){
        
        await this.inputFieldArea.fill("OpticalForecast");
      }

      async selectBaseForecastPrimaryOption(baseForecastsPrimary:string){

        await this.baseForecastOption.selectOption({ label: baseForecastsPrimary });
        
      }

      async clickOnCreateForecastFinalButton(){
      
        await this.forecastCreateFinalOption.click();

      }

      async verifyForecastHasBeenCreatedSuccessfully(){
        
        await this.spinner.waitFor({ state: 'visible' , timeout: 1200000 });
        await this.spinner.waitFor({ state: 'detached' , timeout: 3000000 });
        const forecastNameText = await this.forecastName.innerText();
        expect(forecastNameText).toBe(forecast.forecastName);
      
      }
}