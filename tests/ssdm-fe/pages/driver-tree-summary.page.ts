import { expect, Locator, Page } from "@playwright/test";
import { driverTreeSummary } from '../testdata/fileName.json';
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

  constructor(page: Page) {
    this.page = page;
    this.pageName = this.page.getByRole('button', { name: new RegExp(driverTreeSummary.buttons.pageName, 'i') });
    this.validationSummary = this.page.locator('strong', { hasText: new RegExp(driverTreeSummary.sections.validationSummary, 'i') });
    this.warningsSection = this.page.locator('strong', { hasText: new RegExp(driverTreeSummary.sections.warnings, 'i') });
    this.orphanNodeLocators = this.page.locator('ul.validation-list li span', { hasText: driverTreeSummary.sections.orphanNode });
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
}
