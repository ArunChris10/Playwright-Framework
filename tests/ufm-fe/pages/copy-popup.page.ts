import { Locator, Page } from "@playwright/test";
import debug from "debug";

export class CopyPopupPage {
    readonly page: Page;
    readonly copyData: Locator
    readonly copyForecast: Locator;
    readonly copyScenarioSourceForecastDropdown: Locator;
    readonly copyScenarioDestinationForecastDropdown: Locator;
    readonly copyDataButton: Locator;
    readonly dropdownGenericLoader: Locator;
    readonly forecastDropdown: Locator

    constructor(page: Page) {
        this.page = page;
        this.copyData = page.getByText("Copy data");
        this.copyForecast = page.getByText("Copy forecast data");
        this.copyScenarioSourceForecastDropdown = page.getByRole('button', { name: 'Source forecast' }).first();
        this.copyScenarioDestinationForecastDropdown = page.getByRole('button', { name: 'Source forecast' }).nth(1);
        this.copyDataButton = page.getByText('Copy data');
        this.dropdownGenericLoader = page.locator('//div[@data-testid="skeleton"]');
        this.forecastDropdown = page.getByText("Select forecast");
    }

    async clickOnOpenCopyForecastDataButton() {
        await this.copyForecast.click();
    }

    async clickOnCopyForecastButton() {
        await this.page.mouse.click(0, 0);
        await this.copyData.click();
        await this.page.waitForTimeout(5000);
    }

    async clickOnCopyForecastDataButton() {
        await this.copyForecast.click()
    }

    async clickOnCopyDataButton() {
        await this.copyDataButton.click();
    }

    async selectSourceForecastDropdown(sourceForecastName: string) {
        await this.copyScenarioSourceForecastDropdown.click();
        await this.page.getByRole('option', { name: sourceForecastName, exact: true }).click();
        await this.page.keyboard.press("Escape");
    }

    async selectDestinationForecastDropdown(destinationForecastName: string) {
        await this.copyScenarioDestinationForecastDropdown.click();
        await this.page.getByRole('option', { name: destinationForecastName, exact: true }).click();
        await this.page.keyboard.press("Escape");
    }

    /**
     * Gets dropdown options for the destination forecast dropdown
     * @returns Array of option elements
     */
    private async getDestinationDropdownOptions() {
        debug.log('Opening destination dropdown...');
        await this.copyScenarioDestinationForecastDropdown.click();
    
        await this.waitForDropdownLoaderToDisappear();
        // Get all dropdown options
        const options = this.page.locator('li[role="option"]');
        
        return options;
    }

    async waitForDropdownLoaderToDisappear(): Promise<void> {
        try {
            // Wait up to 3 seconds for at least one skeleton loader to appear
            await this.dropdownGenericLoader.first().waitFor({ state: 'visible', timeout: 3000 });
            
            // Wait for ALL skeleton loaders to be hidden using a function
            await this.page.waitForFunction(
                () => {
                    const skeletons = document.querySelectorAll('div[data-testid="skeleton"]');
                    return Array.from(skeletons).every(skeleton => 
                    window.getComputedStyle(skeleton).display === 'none' || 
                    !(skeleton as HTMLElement).offsetParent
                    );
                },
                { timeout: 10000 }
            );
        } catch (error) {
            //Dont do anything if the loader is not present
        }
    }

    /**
     * Gets dropdown options for the source forecast dropdown
     * @returns Array of option elements
     */
    private async getSourceDropdownOptions() {
        debug.log('Opening source dropdown...');
        await this.copyScenarioSourceForecastDropdown.click();
    
        await this.waitForDropdownLoaderToDisappear();
        
        const options = this.page.locator('li[role="option"]');
        
        return options;
    }

    /**
     * Core method that checks if a scenario is present in dropdown
     * @param scenarioId - The scenario ID to check
     * @param dropdownType - Type of dropdown
     * @returns boolean indicating if the scenario is present in the dropdown
     */
    async isScenarioInDropdown(
        scenarioId: string, 
        dropdownType: 'source' | 'destination'
    ): Promise<boolean> {
        const options = dropdownType === 'source' 
            ? await this.getSourceDropdownOptions() 
            : await this.getDestinationDropdownOptions();
        
        const optionCount = await options.count();
        
        // Ensure we have options loaded
        if (optionCount === 0) {
            debug.log(`No dropdown options found for ${dropdownType} dropdown`);
            return false;
        }
        
        for (let i = 0; i < optionCount; i++) {
            const dataValue = await options.nth(i).getAttribute('data-value');
            if (dataValue?.toString() == scenarioId) {
                return true; // Scenario found
            }
        }
    
        return false; // Scenario not found
    }

    /**
     * Checks if a scenario is present in the SOURCE dropdown
     * @param scenarioId - The scenario ID to check
     * @returns boolean indicating if the scenario is present
     */
    async isScenarioInSourceDropdown(scenarioId: string): Promise<boolean> {
        return this.isScenarioInDropdown(scenarioId, 'source');
    }

    /**
     * Checks if a scenario is present in the DESTINATION dropdown
     * @param scenarioId - The scenario ID to check
     * @returns boolean indicating if the scenario is present
     */
    async isScenarioInDestinationDropdown(scenarioId: string): Promise<boolean> {
        return this.isScenarioInDropdown(scenarioId, 'destination');
    }

    /**
     * Checks if a scenario is NOT present in the SOURCE dropdown
     * @param scenarioId - The scenario ID to check
     * @returns boolean indicating if the scenario is absent
     */
    async isScenarioNotInSourceDropdown(scenarioId: string): Promise<boolean> {
        return !(await this.isScenarioInDropdown(scenarioId, 'source'));
    }

    /**
     * Checks if a scenario is NOT present in the DESTINATION dropdown
     * @param scenarioId - The scenario ID to check
     * @returns boolean indicating if the scenario is absent
     */
    async isScenarioNotInDestinationDropdown(scenarioId: string): Promise<boolean> {
        return !(await this.isScenarioInDropdown(scenarioId, 'destination'));
    }

    /**
     * Closes an open dropdown by clicking elsewhere on the page
     */
    async closeDropdown(): Promise<void> {
        // Click somewhere neutral to close the dropdown
        await this.page.mouse.click(0, 0);
        await this.page.waitForTimeout(500); // Brief wait for dropdown to close
    }

    async clickSourceForecastDropdown(sourceName: string, isCurrentSource: boolean) {
        await this.forecastDropdown.first().click();
        await this.page.waitForTimeout(5000);
        
        const dropdownOptions = this.page.locator('li[role="option"]');
        const optionCount = await dropdownOptions.count();
    
        for (let i = 2; i < optionCount; i++) {
            const optionText = await dropdownOptions.nth(i).textContent();
            if ((isCurrentSource && optionText?.trim() === sourceName) || (!isCurrentSource && optionText?.trim() !== sourceName)) 
            {
                await dropdownOptions.nth(i).click();
                await this.page.waitForTimeout(3000);
                return optionText?.trim();
            }
        }
    }

    async clickTargetForecastDropdown(targetSelection: string, isCurrentTarget: boolean) {
        const secondDropdown = this.page.locator(
            '//span[text()="Destination forecast"]/following::div[@role="button"][1]'
        );
        await secondDropdown.click();
        await this.page.waitForTimeout(5000);
        
        const dropdownOptions = this.page.locator('li[role="option"]');
        
        const optionCount = await dropdownOptions.count();
        
        for (let i = 0; i < optionCount; i++) {
            const optionText = await dropdownOptions.nth(i).textContent();
        
            const trimmedOptionText = optionText?.trim();
        
            if (!trimmedOptionText || trimmedOptionText === "Select forecast") {
                continue;
            }
            if ((isCurrentTarget && trimmedOptionText === targetSelection) || (!isCurrentTarget && trimmedOptionText !== targetSelection)) 
            {
                await dropdownOptions.nth(i).click();
                await this.page.waitForTimeout(3000);
                return trimmedOptionText;
            }
        }
    }
    
}