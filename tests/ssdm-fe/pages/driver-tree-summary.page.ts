import { expect, Locator, Page } from "@playwright/test";
import { driverTreeSummary,testData } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Logger} from "../../common/fixtures/logger-utils";

/**
 * Page Object Model for Driver Tree Summary Page Validation.
 * Encapsulates all actions and assertions for the driver tree summary page.
 */
export class DriverTreeSummaryPageValidation {

  // --- Locators ---
  readonly page: Page;
  readonly pageName: Locator;
  readonly validationSummary: Locator;
  readonly warningsSection: Locator;
  readonly orphanNodeLocators: Locator;
  readonly driverTreeSummaryTab: Locator;
  readonly driverTreeTab: Locator;
  readonly errorList: Locator;
  readonly grainMismatchErrorList: Locator;
  getGrainMismatchBaseLocator: (inputString: number) => string;

  constructor(page: Page) {
    this.page = page;
    this.pageName = this.page.getByRole('button', { name: new RegExp(driverTreeSummary.buttons.pageName, 'i') });
    this.validationSummary = this.page.locator('strong', { hasText: new RegExp(driverTreeSummary.sections.validationSummary, 'i') });
    this.warningsSection = this.page.locator('strong', { hasText: new RegExp(driverTreeSummary.sections.warnings, 'i') });
    this.orphanNodeLocators = this.page.locator('ul.validation-list li span', { hasText: driverTreeSummary.sections.orphanNode });
     this.driverTreeSummaryTab = page.locator('//button[text()="Driver Tree Summary"]');
    this.driverTreeTab = page.locator('//button[text()="Driver Tree"]');
    this.errorList = page.locator('//ul[@class="validation-list"]');
    this.grainMismatchErrorList = page.locator(`//ul[@class="validation-list"]//div[@class]`)

    this.getGrainMismatchBaseLocator = (inputIndex: number) =>
      `//ul[@class="validation-list"]//div[${inputIndex}]`;
  }

  /**
   * Navigates to the Driver Tree Summary page from the landing page,
   * and verifies the presence of orphan nodes.
   */
  async validateOrphanNodePresence() {
    await this.page.waitForTimeout(7000);

    // Navigate to Driver Tree Summary page
    await this.pageName.click();
    await this.validationSummary.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await this.validationSummary.isVisible()).toBeTruthy();

    // Check if warnings section exists
    if (await this.warningsSection.count() === 0) {
      Logger.warn('No warnings section found. Skipping orphan node validation.');
      return;
    }
    await this.warningsSection.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await this.warningsSection.isVisible()).toBeTruthy();

    // Extract the number from the warnings section text
    const warningsText = await this.warningsSection.textContent();
    const warningCount = warningsText ? parseInt(warningsText.trim().split(' ')[0], 10) : 0;
    expect(warningCount).toBeGreaterThan(0);

    // Find all "Orphan Node" entries on the page
    const orphanNodeCount = await this.orphanNodeLocators.count();
    expect(orphanNodeCount).toBe(warningCount);
    for (let i = 0; i < orphanNodeCount; i++) {
      expect(await this.orphanNodeLocators.nth(i).isVisible()).toBeTruthy();
    }
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
