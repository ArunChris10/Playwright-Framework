import { Locator, Page } from "@playwright/test";
import debug from "debug";

export class OpenCurrentForecast {

    readonly page: Page;
    readonly btnOpenCurrentForecast: Locator;
    readonly txtCurrentForecast: Locator;
    readonly actionButton: Locator;
    readonly chooseDifferentDriverButton: Locator;
    readonly forecastInputCell: string;
    readonly allocationMethodDropDown: Locator;
    readonly maintainRatioOption: Locator;
    readonly calculateButton: Locator;
    readonly calculationSuccessfulMessage: Locator;
    readonly calculationSpinner: Locator;
    readonly saveButton: Locator;
    readonly calculateErrorMessage: string
    readonly saveErrorMessage: string
    readonly allocateErrorMessage: string;
    readonly forecastTable: Locator;
    readonly somethingWentWrong: Locator;

    constructor(page: Page) {

        this.page = page;
        this.btnOpenCurrentForecast = page.locator("//button[text()='Open']");
        this.txtCurrentForecast = page.getByText("Current Forecast");
        this.actionButton = this.page.locator('//div[@class="table-container"]//button[contains(text(),"Actions")]')
        this.chooseDifferentDriverButton = page.getByText('Choose different drivers')
        this.forecastInputCell = '//div[contains(@col-id,"forecast") and @role="gridcell"]'
        this.allocationMethodDropDown = this.page.locator('//button[@aria-label="More options"]')
        this.maintainRatioOption = this.page.getByText("Maintain ratio")
        this.calculateButton = this.page.getByText('Calculate');
        this.calculationSuccessfulMessage = this.page.getByText("Calculation was successful, and allocation methods were applied to all dimensions")
        this.calculationSpinner = this.page.getByText('Calculating your inputs')
        this.saveButton = this.page.getByText('Save')
        this.calculateErrorMessage = 'Please edit atleast one cell'
        this.saveErrorMessage = 'Before saving the forecast, calculate your changes in the table.'
        this.allocateErrorMessage = 'Select a method';
        this.forecastTable = this.page.locator('//div[@data-testid="forecast-table"]')
        this.somethingWentWrong = this.page.getByText('Something Went Wrong')

    }

    async clickOnOpenButton() {

        await this.btnOpenCurrentForecast.click();
    }

    async clickOnBreadcrum(sbaName: string) {

        await this.page.getByText(`UFM ${sbaName}`).click();
    }

    async verifyCreateForecastScreenIsVisible() {

        await this.txtCurrentForecast.isVisible();
    }

    async clickOnActionButton() {
        this.actionButton.click()
    }

    async clickOnChooseDifferentDriver() {
        await this.chooseDifferentDriverButton.waitFor({ state: "visible" })

        await this.chooseDifferentDriverButton.click()
    }

    async validateDriverPresence(driverName: string) {
        await this.page.locator(`//div[@col-id="nodeName"]//span[contains(text(),"${driverName}")]`).waitFor({ state: "visible" })
        return true
    }

    async fillForecastInputCell(noOfCells, inputValue) {
        let count = 0

        let forecastInputElement = (await this.page.locator("(" + this.forecastInputCell + ")" + "[1]"))

        let col_id = (await forecastInputElement.getAttribute("col-id"))?.split('.')?.[0]

        let updated_col_ids = new Map()
        let old_col_ids = new Map()

        while (count < noOfCells) {
            if (typeof col_id === 'string') {
                let actualColId = `${parseInt(col_id) + count}.forecast`;

                let currentValue: string | number = await this.page.locator(`//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count}.forecast")]//div[contains(@class,"tableCell")]/span`).innerText()

                currentValue = parseFloat(currentValue.replace(/[$,]/g, ''));
                old_col_ids.set(actualColId, currentValue)
                let incrementedValue = currentValue + inputValue
                updated_col_ids.set(actualColId, incrementedValue);

                await this.page.locator(`//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count}.forecast")]//div[contains(@class,"tableCell")]/span`).dblclick().then(async () => {

                    await this.page.keyboard.type(incrementedValue.toString());
                    await this.page.keyboard.press('Shift+Tab')

                });
            }
            else {
                debug.log("Unable to convert the col-id")
            }
            count++
        }

        return { "updated_col_ids": updated_col_ids, "old_col_ids": old_col_ids }
    }

    async fillForecastQuarterInputCell(noOfCells, inputValue) {
        let count = 0

        let forecastInputElement = (await this.page.locator("(" + this.forecastInputCell + ")" + "[1]"))

        let col_id = (await forecastInputElement.getAttribute("col-id"))?.split('.')?.[0]

        let updated_col_ids = new Map()
        let old_col_ids = new Map()

        while (count < noOfCells) {
            if (typeof col_id === 'string') {
                let actualColId = `${parseInt(col_id) + count}Q4.forecast`;

                let currentValue: string | number = await this.page.locator(`//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count}Q4.forecast")]//div[contains(@class,"tableCell")]/span`).innerText()

                currentValue = parseFloat(currentValue.replace(/[$,]/g, ''));
                old_col_ids.set(actualColId, currentValue)
                let incrementedValue = currentValue + inputValue
                updated_col_ids.set(actualColId, incrementedValue);

                await this.page.locator(`//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count}Q4.forecast")]//div[contains(@class,"tableCell")]/span`).dblclick().then(async () => {

                    await this.page.keyboard.type(incrementedValue.toString());
                    await this.page.keyboard.press('Shift+Tab')

                });
            }
            else {
                debug.log("Unable to convert the col-id")
            }
            count++
        }

        return { "updated_col_ids": updated_col_ids, "old_col_ids": old_col_ids }
    }

    async selectAllocationMethod(allocationMethod: string) {
        await this.allocationMethodDropDown.click()
        await this.page.getByText(allocationMethod).click()
    }

    async allocationErrorMessageExistence() {
        const allocationErrorMessageExistence = await this.page.waitForSelector(`//span[contains(text(),"${this.allocateErrorMessage}")]`, { state: 'attached' })
            .then(() => true)
            .catch(() => false);

        return allocationErrorMessageExistence
    }

    async calculateErrorMessageExistence() {

        const calculateErrorMessageExistence = await this.page.waitForSelector(`//span[contains(text(),"${this.calculateErrorMessage}")]`, { state: 'attached' })
            .then(() => true)
            .catch(() => false);

        return calculateErrorMessageExistence
    }

    async clickOnCalculateButton() {
        await this.calculateButton.click()
    }

    async waitForCalculationSuccessMessage() {
        await this.calculationSuccessfulMessage.waitFor({ state: "visible" })
    }

    async saveErrorMessageExistence() {

        const saveErrorMessageExistence = await this.page.waitForSelector(`//span[contains(text(),"${this.saveErrorMessage}")]`, { state: 'attached', timeout: 3000 })
            .then(() => true)
            .catch(() => false);

        return saveErrorMessageExistence
    }

    async clickOnSave() {
        await this.saveButton.click()
        await this.calculationSpinner.waitFor({ state: "hidden" })
        await this.forecastTable.waitFor({ state: "visible" })
    }

    async getDriverMonthForecastValue(colIdMap) {

        for (let key of colIdMap.keys()) {
            // Get the element with the corresponding col-id
            var forecastValueFromTable = await this.page.locator(`//div[contains(@col-id,"${key}")]//div[contains(@class,"tableCell")]/span`);

            if (forecastValueFromTable) {
                // Get the current inner text of the element
                var currentInnerText: string | number = await forecastValueFromTable.innerText()
                currentInnerText = parseFloat(currentInnerText.replace(/[$,]/g, ''));
                // Convert the inner text to a number and update the map value
                colIdMap.set(key, currentInnerText);
            }
        }

        // Return the updated map
        return colIdMap;
    }

    async isSomethingWentWrongError() {
        return this.somethingWentWrong.isVisible()
    }

}