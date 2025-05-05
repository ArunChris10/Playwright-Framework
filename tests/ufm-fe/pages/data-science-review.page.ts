import { Page, expect } from "@playwright/test";
import { Home } from "../../common/pages/home.page";

export class DataScienceReviewPage {
    private readonly page: Page;
    private readonly home: Home;

    constructor(page: Page) {
        this.page = page;
        this.home = new Home(page); 
    }

    async navigateToAOP() {
        try {
            await this.home.open('Admins');
            await this.home.openMenuitem('Data Science Review');

            // verify if "AOP" text is visible on the screen
            const aopText = this.page.getByText('AOP', { exact: true });
            await expect(aopText).toBeVisible({ timeout: 120000 });
        } catch (error) {
            throw new Error(`Failed to navigate to AOP: ${error.message}`);
        }
    }
}