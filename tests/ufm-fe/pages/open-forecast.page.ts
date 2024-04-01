import { expect, Locator, Page } from "@playwright/test";
import forecast from '../testdata/forecast.json';

export class OpenCurrentForecast{

    readonly page: Page;
    readonly btnOpenCurrentForecast: Locator;
    readonly txtCurrentForecast: Locator;
 
    constructor(page: Page) {

        this.page = page;
        this.btnOpenCurrentForecast = page.locator("//button[text()='Open']");
        this.txtCurrentForecast = page.getByText("Current Forecast");
        
    }

    async clickOnOpenButton(){

        await this.btnOpenCurrentForecast.click();
    }

    async clickOnBreadcrum(sbaName: string){

        await this.page.getByText(`${sbaName}`).click();
    }

    async verifyCreateForecastScreenIsVisible(){

        await this.txtCurrentForecast.isVisible();
    }
}