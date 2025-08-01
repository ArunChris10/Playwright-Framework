import { Locator, Page } from "@playwright/test";

export class FiltersPage {
  readonly page: Page;
  readonly filtersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filtersButton = page.locator('//button[text()="Filters" and contains(@class, "KPIPageHeader_filters")]');
  }

  /**
   * Clicks on the Filters button (after drivers are applied)
   */
  async clickFiltersButton(): Promise<void> {
    await this.filtersButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.filtersButton.click();
  }

  /**
   * Verifies that all expected filter options are visible
   * @param expectedFilters - Array of expected filter names
   * @returns Promise<boolean> - True if all filters are visible
   */
  async verifyFilterOptionsVisible(expectedFilters: string[]): Promise<boolean> {
    let allFiltersVisible = true;
    
    for (const filterName of expectedFilters) {
      const filterButton = this.page.getByRole('button', { name: filterName });
      const isVisible = await filterButton.isVisible();
      
      if (!isVisible) {
        console.log(`Filter "${filterName}" is not visible`);
        allFiltersVisible = false;
      } else {
        console.log(`Filter "${filterName}" is visible`);
      }
    }
    
    return allFiltersVisible;
  }

  /**
   * Compares two arrays of filter options to check if they are identical
   * @param filtersBeforeDrivers - Filter options before applying drivers
   * @param filtersAfterDrivers - Filter options after applying drivers
   * @returns boolean - True if both arrays contain the same filters
   */
  async compareFilterOptions(filtersBeforeDrivers: string[], filtersAfterDrivers: string[]): Promise<boolean> {
    if (filtersBeforeDrivers.length !== filtersAfterDrivers.length) {
      console.log(`Filter count mismatch: Before (${filtersBeforeDrivers.length}) vs After (${filtersAfterDrivers.length})`);
      return false;
    }

    // Sort both arrays to ensure order doesn't matter
    const sortedBefore = [...filtersBeforeDrivers].sort();
    const sortedAfter = [...filtersAfterDrivers].sort();

    for (let i = 0; i < sortedBefore.length; i++) {
      if (sortedBefore[i] !== sortedAfter[i]) {
        console.log(`Filter mismatch at index ${i}: "${sortedBefore[i]}" vs "${sortedAfter[i]}"`);
        return false;
      }
    }

    console.log('All filter options match before and after applying drivers');
    return true;
  }


  /**
   * Gets all available filter options and returns them as an array
   * @returns Promise<string[]> - Array of filter option names
   */
  async getAvailableFilterOptions(): Promise<string[]> {
    const filterOptions: string[] = [];
    
    // Define the filter button names to check
    const filterNames = ['Filter sets', 'Department', 'Location', 'Reporting', 'Business Area'];
    
    for (const filterName of filterNames) {
    const filterButton = this.page.getByRole('button', { name: filterName });
    if (await filterButton.isVisible()) {
        filterOptions.push(filterName);
    }
    }
    
    return filterOptions;
  }

  /**
   * Applies the default filter selections and closes the filter panel
   */
  async applyDefaultFilters(): Promise<void> {
    // Click on apply btn to close the filter chip with the default choices
    await this.page.getByTestId('apply-btn').click();
    await this.page.waitForTimeout(2000);
  }
}