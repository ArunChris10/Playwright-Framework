import { expect, Locator, Page } from "@playwright/test";
export class AddDriverPage {



    readonly page: Page;
    readonly searchDriverField: Locator;
    readonly driverNodeTree: string;
    readonly searchIcon: Locator;
    readonly applyDrivers: Locator;
    readonly driverSearchResult: string;
    readonly driversModalHeader: Locator;
    readonly FilterButton: Locator

    constructor(page: Page) {
        this.page = page;
        this.searchDriverField = this.page.getByPlaceholder("Search drivers");
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
    /**
     * Clicks on the filter chip button to open filter options
     */
    async clickFilterChip(): Promise<void> {
        await this.FilterButton.click();
    }

    /**
     * Applies the default filter selections and closes the filter panel
     */
    async applyDefaultFilters(): Promise<void> {
        // Click on apply btn to close the filter chip with the default choices
        await this.page.getByTestId('apply-btn').click();
        await this.page.waitForTimeout(2000);
    }

    async waitForKPITableLoad() {
        await this.page.waitForSelector('[data-testid="forecast-table"]', { state: 'visible', timeout: 100000 });
        return true
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
    /**
     * Verifies that recently searched drivers appear in the dropdown
     * @param driverNames - Array of driver names to verify
     * @returns boolean indicating if all recent search options exist
     */
    async verifyRecentSearchDriver(driverNames: string[]): Promise<boolean> {
        let allDriversVisible = true;
        
        for (const driverName of driverNames) {
            const recentSearchOption = this.page.getByRole('option', { name: driverName });
            const isVisible = await recentSearchOption.isVisible();
            
            if (!isVisible) {
                console.log(`Driver "${driverName}" not found in recent searches`);
                allDriversVisible = false;
            } else {
                console.log(`Driver "${driverName}" found in recent searches`);
            }
        }
        
        return allDriversVisible;
    }
    

    async verifyFilterButtonIsVisible(): Promise<void> {
        await expect(this.FilterButton).toBeVisible();
    }

    async inputDriverName(driverName: string) {
        await this.searchDriverField.fill(driverName).then(async () => {
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
    /**
     * Clicks on the "View in Driver Tree" option for the first search result
     * @returns Promise<string> - Returns the name of the driver for which "View in Driver Tree" was clicked
     */
    async clickOnViewInDriverTreeForFirstOption(): Promise<string> {
        const searchResults = this.page.locator('[role="option"]');

        const firstResult = searchResults.first();
        
        // Get the driver name from the first result
        const viewInDriverTreeLink = firstResult.getByTestId('viewInDriverTreeLink');
        await viewInDriverTreeLink.click();
        
        // Wait for the tree to load
        await this.page.waitForTimeout(2000);

        const driverName = await this.searchDriverField.inputValue();

        if (!driverName) {
            throw new Error("Could not get driver name from search field after clicking View in Driver Tree");
        }
        
        console.log(`Extracted driver name from search field: "${driverName}"`);
        return driverName.trim();
        
    }

    /**
     * Clicks on the driver label in the driver tree after viewing in tree
     * @param driverName - The name of the driver to click
     */
    async clickOnDriverInTree(driverName: string): Promise<void> {
        const driverLabel = this.page.locator('label').filter({ hasText: driverName });
        await driverLabel.click();
        console.log(`Clicked on driver "${driverName}" in the tree`);
    }

    /**
     * Searches for drivers and clicks "View in Driver Tree" for the first result
     * @param searchTerm - The search term to use
     * @returns Promise<string> - Returns the name of the driver
     */
    async searchAndViewFirstDriverInTree(searchTerm: string): Promise<string> {
        // Click on search field and enter search term
        await this.searchDriverField.click();
        await this.searchDriverField.fill(searchTerm);
        
        // Wait for search results to load
        await this.page.waitForTimeout(2000);
        
        // Click "View in Driver Tree" for the first result and return driver name
        const driverName = await this.clickOnViewInDriverTreeForFirstOption();

        
        return driverName;
    }

    /**
     * Verifies that recently searched drivers appear when clicking the search box
     * @returns Promise<boolean> - Returns true if recent searches are visible
     */
    async verifyRecentSearchesOnSearchBoxClick(): Promise<boolean> {
        // Click on the search drivers input field
        await this.searchDriverField.click();
        
        // Wait for dropdown to appear
        await this.page.waitForTimeout(1000);
        
        // Check if there are any options visible (recent searches)
        const searchOptions = this.page.locator('[role="option"]');
        const optionCount = await searchOptions.count();
        
        if (optionCount > 0) {
            console.log(`Found ${optionCount} recent search options`);
            return true;
        } else {
            console.log("No recent search options found");
            return false;
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
    /**
     * Searches for drivers using the search input field
     * @param searchTerm - The search term to use (defaults to 'a')
     * @returns Promise<void>
    */
    async searchDrivers(searchTerm: string = "a"): Promise<void> {
        // Click on the search drivers input field
        await this.searchDriverField.click();

        // Type a search term to get search results
        await this.searchDriverField.fill(searchTerm);

        // Wait for search results to load
        await this.page.waitForTimeout(2000);
    }
    /**
     * Verifies that "View in driver tree" option exists in search results
     * @returns boolean indicating if "View in driver tree" option exists
    */
    async verifyTotalSearchResults(): Promise<boolean> {
        // Verify that search results contain the "View in driver tree" option
        const searchResults = this.page.locator('[role="option"]');
        const resultCount = await searchResults.count();

        if (resultCount === 0) {
            console.log("No search results found");
            return false;
        }
        return resultCount === 10;
    }

    /**
     * Verifies that checkbox exists in search result option
     * @returns boolean indicating if checkbox exists
    */
    async verifyCheckboxResults(): Promise<boolean> {
        const searchContainer = this.page.locator('//div[@class="MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiAutocomplete-paper dropdown-container css-t4hinj"]');
        const searchResults = searchContainer.locator('//ul//li//input[@type="checkbox"]');
        const resultCount = await searchResults.count();

        if (resultCount === 0) {
            console.log("No checkboxes found");
            return false;
        }
    
        // verify checkbox exists in each search result
        for (let i = 0; i < resultCount; i++) {
            const checkbox = searchResults.nth(i);
            const isVisible = await checkbox.isVisible();
            if (!isVisible) {
                return false;
            }
        }
    
        return true;
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
    
    /**
     * Verifies that search results are immediately available in the driver search interface
     * 
     * @returns Promise<boolean> - Returns true if search results are found (search starts immediately),
     *                            false if no results are found (search requires user input)
     * 
    */
    async verifySearchStartsImmediately(): Promise<Boolean> {
        // Locate all search result options in the dropdown/list
        const searchResults = this.page.locator('[role="option"]');

        // Count the number of search results present
        const resultCount = await searchResults.count();

        // Return true if results exist (search starts immediately), false otherwise
        return resultCount !== 0;
    }

    async searchAndApplyDrivers(driverNames: string[]) {
        for (const driverName of driverNames) {

            await this.waitForPageLoad();
            await this.inputDriverName(driverName);
            await this.selectDriver(driverName);


        } await this.clickOnApplyDrivers();
    }

    async clickOnApplyDrivers() {
        await this.applyDrivers.click();
    }
}