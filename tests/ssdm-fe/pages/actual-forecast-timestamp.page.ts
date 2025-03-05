import { expect, Locator, Page } from "@playwright/test";
import moment from 'moment';

export class ViewTimestampFunctionality {

    readonly page: Page;
    readonly actualsDataReceived: Locator;
    readonly forecastDataReceived: Locator;
    readonly actualDateText: Locator;
    readonly forecastDateText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.actualsDataReceived = this.page.getByText('Actuals data received on:');
        this.forecastDataReceived = this.page.getByText('Forecast data received on:');
        this.actualDateText = this.page.locator('(//div[@data-testid="datasetContainer"]//child::p[@class="textContainer"])[1]');
        this.forecastDateText = this.page.locator('(//div[@data-testid="datasetContainer"]//child::p[@class="textContainer"])[2]');

    }

    async visibilityOfActualAndForecastTimestamp(dataReceived, dateText, expectedText) {
        await dataReceived.isVisible();
        const text = await dateText.innerText();
        const splitText = await text.split(':');
        const data = splitText[0] + ':';
        const timestamp = splitText.length > 1 ? splitText[1].trim() : '';
        await expect(data).toContain(expectedText);
        await expect(moment(timestamp, 'MMMM D, YYYY, h:mm A').isValid()).toBeTruthy();
    }

    async visibilityOfTimestamp() {
        await this.visibilityOfActualAndForecastTimestamp(this.actualsDataReceived, this.actualDateText, 'Actuals data received on:');
        await this.visibilityOfActualAndForecastTimestamp(this.forecastDataReceived, this.forecastDateText, 'Forecast data received on:');
    }
}