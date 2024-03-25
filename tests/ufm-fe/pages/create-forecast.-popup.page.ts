import { expect, Locator, Page } from "@playwright/test";
import forecast from '../testdata/forecast.json'

export class CreateForecastPopup{

    readonly page: Page;
    readonly btncreateForecastButton: Locator;
    readonly btnContinue: Locator;
    readonly drpBaseForecastOption: Locator;
    readonly btnForecastCreateFinalOption: Locator;
    readonly spinner: Locator;
    
    constructor(page: Page) {

        this.page = page;
        this.btncreateForecastButton = page.getByText('Create forecast');
        this.btnContinue = page.getByText('Continue');
        this.drpBaseForecastOption = page.locator('select');
        this.spinner = page.locator("//span[contains(@class, 'Spinner')]");
        this.btnForecastCreateFinalOption = page.getByTestId("create-forecast-id");
      }

      async clickOnCreateForecast(){
         
        await this.clickOnCreateForecast();
      }
    
      async clickOnPrepareTheForecastForParticularDrivers(forecastPreparationName: string) {
        await this.page.getByText(`Prepare the forecast for ${forecastPreparationName} drivers.`).click();
      }

      async clickOnContinueButton(){

        await this.btnContinue.click();
      }

      async fillTheInputField(forecastName: string){

        await this.page.getByPlaceholder(`${forecastName}`).fill("OpticalForecast");
      }

      async selectBaseForecastPrimaryOption(baseForecastsPrimary:string){

        await this.drpBaseForecastOption.selectOption({ label: baseForecastsPrimary });
        
      }

      async clickOnCreateForecastFinalButton(){
      
        await this.btnForecastCreateFinalOption.click();

      }

      async verifyForecastHasBeenCreatedSuccessfully(finalForecastCreated: string){
        
        await this.spinner.waitFor({ state: 'visible' , timeout: 300000 });
        await this.spinner.waitFor({ state: 'detached' , timeout: 420000 });
        const forecastNameText = await this.page.getByText(`${finalForecastCreated}`).innerText();
        expect(forecastNameText).toBe(forecast.forecastName);
      
      }
}