import { expect, Locator, Page } from "@playwright/test";
export class AddDriverPage {



    readonly page: Page;
    readonly searchDriverField: string;
    readonly driverNodeTree: string;
    readonly searchIcon: Locator;
    readonly applyDrivers: Locator;
    readonly driverSearchResult: string;
    readonly driversModalHeader: Locator;
    readonly FilterButton: Locator

    constructor(page: Page) {
        this.page = page;
        this.searchDriverField = '//input[@placeholder="Search drivers"]'
        this.driverNodeTree = '//div[contains(@class,"driverTreeNode")]'
        this.searchIcon = page.locator("//button[@aria-label='icon']")
        this.applyDrivers = page.getByText('Apply Drivers')
        this.driverSearchResult = 'span[data-testid="remainingWord"]'
        this.driversModalHeader = this.page.locator('.modalTitle', { hasText: 'Add drivers' })
        this.FilterButton = page.getByTestId('filter-chip');

    }

    async waitForPageLoad() {
        await this.driversModalHeader.isVisible({ timeout: 1000 })
        await this.page.waitForSelector(this.driverNodeTree)
        return true
    }

    async waitForKPITableLoad() {
        await this.page.waitForSelector('[data-testid="forecast-table"]', { state: 'visible', timeout: 100000 });
        return true
    }
    /**
     * Searches for drivers using the search input field
     * @param searchTerm - The search term to use (defaults to 'a')
     * @returns Promise<void>
     */
    async searchDrivers(searchTerm: string = "a"): Promise<void> {
        // Click on the search drivers input field
        await this.page.getByPlaceholder("Search drivers").click();

        // Type a search term to get search results
        await this.page.getByPlaceholder("Search drivers").fill(searchTerm);

        // Wait for search results to load
        await this.page.waitForTimeout(2000);
    }

    /**
     * Verifies that "View in driver tree" option exists in search results
     * @returns boolean indicating if "View in driver tree" option exists
     */
    async verifyViewInDriverTreeOption(): Promise<boolean> {
        // Verify that search results contain the "View in driver tree" option
        const searchResults = this.page.locator('[role="option"]');
        const resultCount = await searchResults.count();

        if (resultCount === 0) {
            console.log("No search results found");
            return false;
        }

        // Check if any of the search results have the "View in driver tree" link
        for (let i = 0; i < resultCount; i++) {
            const result = searchResults.nth(i);
            const viewInDriverTreeLink = result.getByTestId("viewInDriverTreeLink");
            if (await viewInDriverTreeLink.isVisible()) {
                console.log(
                    `Found "View in driver tree" option in search result ${i + 1}`
                );
                return true;
            }
        }

        console.log('No "View in driver tree" option found in search results');
        return false;
    }

    async verifyFilterButtonIsVisible(): Promise<void> {
        await expect(this.FilterButton).toBeVisible();
    }

    async inputDriverName(driverName: string) {
        await this.page.locator(this.searchDriverField).fill(driverName).then(async () => {
            await this.page.waitForTimeout(1000)
            await this.page.keyboard.press('Enter')
        })
    }

    async selectDriver(driverName: string) {
        // await this.page.waitForSelector(this.driverSearchResult);
        await this.page.evaluate(() => {
            const elements = document.querySelectorAll('[data-testid="virtualTree"]');
            const lastElement = elements[elements.length - 1];
            lastElement.scrollIntoView();
        });
        await this.page.waitForSelector(`//div[@class="noncalculated"]//parent::*//parent::*//strong[contains(text(),"${driverName}")] `, { state: 'attached' });
        await this.page.waitForTimeout(2000);
        await this.page.getByRole('option', { name: `${driverName} input View in` }).getByLabel(`${driverName}`).first().check();
    }

    async onCheckDriverBasedOnName(driverName: string) {
        const driverCheckbox = this.page.locator(`//label[contains(@class, 'Checkbox-module_label')]//span[contains(text(), "${driverName}")]`);
        const isDriverVisible = await driverCheckbox.isVisible();
    
        if (isDriverVisible) {
            await driverCheckbox.click();
            console.log(`Driver "${driverName}" has been checked.`);
        } else {
            console.error(`Driver "${driverName}" not found or not visible.`);
        }
    }

    async switchSelectedDriverOrder() {
        const selectedDriversContainer = this.page.locator('//div[@class="customDriverSelected"]');
        const firstDriverDragHandle = selectedDriversContainer.locator(
            '//ul//li//button[contains(@class, "MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium css-1yxmbwk")]'
        ).first();
        const secondDriverDragHandle = selectedDriversContainer.locator(
            '//ul//li[last()]//button[contains(@class, "MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium css-1yxmbwk")]'
        ).first();
        await firstDriverDragHandle.isVisible();
        await secondDriverDragHandle.isVisible();
        await firstDriverDragHandle.dragTo(secondDriverDragHandle);
        console.log(`Switched order of drivers successfully.`);
    }

    async getFirstDriverName() {
        const selectedDriversContainer = this.page.locator('//div[@class="customDriverSelected"]');
        const firstDriverDragHandle = selectedDriversContainer.locator(
            '//ul//li//div[contains(@class, "MuiListItemText-root css-1tsvksn")]'
        ).first();
        await firstDriverDragHandle.isVisible();
        const firstDriverName = await firstDriverDragHandle.textContent();
        return firstDriverName?.trim() || '';
    }

    async searchAndApplyDrivers(driverNames: string[]) {
        for (const driverName of driverNames) {

            await this.waitForPageLoad();
            await this.inputDriverName(driverName);
            await this.selectDriver(driverName);


        } await this.clickOnApplyDrivers();
    }

    async clickOnApplyDrivers() {
        await this.applyDrivers.click()
    }
}