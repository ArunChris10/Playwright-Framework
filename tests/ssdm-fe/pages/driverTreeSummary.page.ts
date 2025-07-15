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
  readonly errorList: Locator;
  readonly grainMismatchErrorList: Locator;
  getGrainMismatchBaseLocator: (inputString: number) => string;


  constructor(page: Page) {
    this.page = page;

    this.driverTreeSummaryTab = page.locator('//button[text()="Driver Tree Summary"]');
    this.driverTreeTab = page.locator('//button[text()="Driver Tree"]');
    this.errorList = page.locator('//ul[@class="validation-list"]');
    this.grainMismatchErrorList = page.locator(`//ul[@class="validation-list"]//div[@class]`)

    this.getGrainMismatchBaseLocator = (inputIndex: number) =>
      `//ul[@class="validation-list"]//div[${inputIndex}]`;
  }

  async clickdriverTreeSummary() {
    await this.driverTreeSummaryTab.click();
  }

  async clickdriverTreeTab() {
    await this.driverTreeTab.click({ force: true });
  }

  async validateMissingInputError(inputString: string) {
    const listItems = this.errorList.locator('li');
    const count = await listItems.count();
    for (let i = 0; i < count; i++) {
      const item = listItems.nth(i);
      console.log(await item.textContent());
      const text = await item.textContent();
      if (text && text.includes(inputString)) {
        expect(text).toContain(testData.missingInputFieldmessage);
        break;
      }
    }
  }

  async validateGrainMismatchError(inputString: string, driverTreeGrains, ufdmgrains) {
    const grainMismatchErrorListCount = await this.grainMismatchErrorList.count();
    let found = false;
    for (let i = 1; i < grainMismatchErrorListCount+1; i++) {
      const item = this.page.locator(this.getGrainMismatchBaseLocator(i)).locator('div').first();
      const nodeNameText = await item.textContent();
      console.log("Scanning list at index " + i + " " + nodeNameText);
      if (nodeNameText && nodeNameText.includes(inputString)) {
        found = true;
        const errorMessage = await this.page.locator(`${this.getGrainMismatchBaseLocator(i)}/preceding-sibling::li[1]`).textContent();
        console.log("Error Message: " + errorMessage);
        expect(errorMessage).toContain(testData.grainMismatchFieldMessage);
        const acturalDriverTreeGrains = await this.page.locator(this.getGrainMismatchBaseLocator(i)).locator('div').nth(2).textContent();
        const actualUfdmGrains = await this.page.locator(this.getGrainMismatchBaseLocator(i)).locator('div').nth(3).textContent();
        const expectedDriverTreeGrains = (driverTreeGrains || "").replace(/\s+/g, '').toLowerCase();
        const expectedUfdmgrains = (ufdmgrains || "").replace(/\s+/g, '').toLowerCase();
        expect(acturalDriverTreeGrains?.toLowerCase()).toContain(expectedDriverTreeGrains);
        expect(actualUfdmGrains?.toLowerCase()).toContain(expectedUfdmgrains);
        break;
      }
    }
    if (!found) {
      throw new Error(`Grain mismatch error with input "${inputString}" not found.`);
    }
  }

}