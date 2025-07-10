import { expect, Locator, Page } from "@playwright/test";
import { testData, sortingOptions, groupByOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { NodeCRUDValidation } from './node-crud-operations.page';
import exp from "constants";

/**
 * Page Object Model for Landing Page Validation.
 * Encapsulates all actions and assertions for the landing page.
 */
export class DriverTreeSummary {

  // --- Locators ---
  readonly page: Page;

  readonly driverTreeSummaryTab: Locator;
  readonly driverTreeTab: Locator;


  constructor(page: Page) {
    this.page = page;

    this.driverTreeSummaryTab = page.locator('//button[text()="Driver Tree Summary"]');
    this.driverTreeTab = page.locator('//button[text()="Driver Tree"]');
  }

  async clickdriverTreeSummary() {
    await this.driverTreeSummaryTab.click();
  }

  async clickdriverTreeTab() {
    await this.driverTreeTab.click(); 
  }

  // Iterate through each li in the validation list, match with input string, then capture the text of the closing span
  async validateMissingInputError(inputString: string) {
    const listItems = this.page.locator('//ul[@class="validation-list"]//li');
    const count = await listItems.count();
    for (let i = 0; i < count; i++) {
      const item = listItems.nth(i);
      console.log(await item.textContent());
      const text = await item.textContent();
      if (text && text.includes(inputString)) {
        expect(text).toContain(testData.missingInputFieldmessage); // Ensure the text is not empty
        break;
      }
    }
  }
}