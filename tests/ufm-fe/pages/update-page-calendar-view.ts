import { Locator, Page } from "@playwright/test";

export class UpdatePageCalendarView {

    readonly page: Page;
    readonly calendar: Locator;
    readonly monthRadioButton: Locator;
    readonly quarterRadioButton: Locator;
    readonly yearRadioButton: Locator;
    readonly applyChangesButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.calendar = page.locator('div[data-testid="date-range-component"]');
        this.monthRadioButton = this.page.locator('input[value="MONTH"]');
        this.quarterRadioButton = this.page.locator('input[value="QUARTER"]');
        this.yearRadioButton = this.page.locator('input[value="YEAR"]');
        this.applyChangesButton = this.page.locator('button:has-text("Apply changes")');
    }

    async waitForPageLoad() {
        await this.calendar.waitFor();
    }

    async openCalendarModal() {
        await this.calendar.click();
    }

    async selectInterval(intervalType: string) {

        // Open the calendar modal
        await this.openCalendarModal();

        switch (intervalType) {
            case 'month':
                await this.monthRadioButton.click();
                break;
            case 'quarter':
                await this.quarterRadioButton.click();
                break;
            case 'year':
                await this.yearRadioButton.click();
                break;
            default:
                break;
        }
        this.closeCalendarModal();
        await this.page.waitForTimeout(5000);
        this.applyChangesButton.click();
        await this.page.waitForTimeout(10000);
        
    }

    async closeCalendarModal() {
        await this.page.keyboard.press('Escape');
    }

}