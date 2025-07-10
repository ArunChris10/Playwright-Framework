import { expect, Locator, Page } from "@playwright/test";
import { testData, sortingOptions, groupByOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { NodeCRUDValidation } from './node-crud-operations.page';

/**
 * Page Object Model for Landing Page Validation.
 * Encapsulates all actions and assertions for the landing page.
 */
export class CreateNewNode {

  // --- Locators ---
  readonly page: Page;
  readonly createNewNodeIcon: Locator;
  readonly panelContainer: Locator;
  readonly missingInputMessage: Locator;
  readonly multiSelectionDropdown: Locator;
  readonly dropdownArrow: Locator;
  readonly dropdownArrowOpen: Locator;
  readonly multiSelectTextBox: Locator;
  readonly driverTreeSummaryTab: Locator;

  // Parameterized XPath generators
  readonly getFilterButtonXPath: (label: string) => string;
  readonly getGridValueXPath: (dataFieldAttribute: string) => string;
  readonly getSortOptionXPath: (sortLabel: string) => string;

  constructor(page: Page) {
    this.page = page;
    this.createNewNodeIcon = page.locator('[data-testid="AddCardOutlinedIcon"]');
    this.panelContainer = page.locator('//div[@class="panel-container"]');
    this.missingInputMessage = page.locator('//div[@class="mx-point-5"]');
    this.multiSelectionDropdown = page.locator('//div[@role="button"]');
    this.dropdownArrow = page.locator(`//span[contains(@class, "multiselect-arrow")]`);
    this.dropdownArrowOpen = page.locator(`//span[contains(@class, "multiselect-arrow open")]`);
    this.multiSelectTextBox = page.locator(`//div[@class="multiselect-box"]`);
    this.driverTreeSummaryTab = page.locator('//button[text()="Driver Tree Summary"]');

    // Parameterized XPath generators
    this.getFilterButtonXPath = (label: string) =>
      `//div[span[contains(., "${label}")] and button[@aria-label="Filter"]]/button`;
    this.getGridValueXPath = (dataFieldAttribute: string) =>
      `[data-field="${dataFieldAttribute}"][role="gridcell"]`;
    this.getSortOptionXPath = (sortLabel: string) =>
      `//div[normalize-space(text())="${sortLabel}"]`;
  }

  getCheckboxByLabel(label: string): Locator {
    return this.page.locator(`//input[@type="checkbox" and following-sibling::span[normalize-space(text())="${label}"]]`);
  }

  getInputByFieldName(fieldName: string): Locator {
    return this.page.locator(`//div[text()="${fieldName}"]/parent::div//input[@role="combobox"]`);
  }

  getFirstOptionForGranularity(): Locator {
    return this.page.locator('(//input[@type="checkbox" and following-sibling::span])[1]');
  }

  async clickNewNodeButton() {
    await this.createNewNodeIcon.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.createNewNodeIcon.click();
  }

  async selectCreatedNode(fieldName: string, nodeName: string) {
    await this.fillAndValidateInputByFieldName(fieldName, nodeName);
  }

  async selectMandatoryDropdownValues(index: number, checkboxLabel?: string) {
    let checkbox;
    const dropdownArrow = this.dropdownArrow.nth(index - 1);
    const dropdownArrowHandle = await dropdownArrow.elementHandle();
    if (dropdownArrowHandle) {
      await this.page.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'auto' }), dropdownArrowHandle);
    }
    //if (await this.dropdownArrowOpen.nth(index - 1).isHidden()) {
    await dropdownArrow.click();
    //}
    if (index == 1) {
      checkbox = checkboxLabel ? this.getCheckboxByLabel(checkboxLabel) : this.getFirstOptionForGranularity();
    } else {
      checkbox = this.getFirstOptionForGranularity();
    }
    await checkbox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
      await this.panelContainer.click();
    }

  }

  async fillAndValidateInputByFieldName(fieldName: string, value: string) {
    const input = this.getInputByFieldName(fieldName);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(value);
    await this.page.keyboard.press('Enter');
    const inputValue = await input.inputValue();
    expect(inputValue).toBe(value);
  }

  async validateMissingInputMessage() {
    expect(await this.missingInputMessage.count()).toBe(4);
    for (let i = 0; i < 4; i++) {
      const message = await this.missingInputMessage.nth(i).textContent();
      expect(message).toContain(testData.missingInputFieldmessage);
    }
  }


  async validateNoMissingInputMessage() {
      await expect(this.missingInputMessage).toHaveCount(0);
  }

  async clickdriverTreeSummary() {
    await this.driverTreeSummaryTab.click();
  }

  // Iterate through each li in the validation list, match with input string, then capture the text of the closing span
  async getValidationListMessageByInput(inputString: string): Promise<string | null> {
    const listItems = this.page.locator('//ul[@class="validation-list"]//li');
    const count = await listItems.count();
    for (let i = 0; i < count; i++) {
      const item = listItems.nth(i);
      const text = await item.textContent();
      if (text && text.includes(inputString)) {
        // Capture the text of the closing span inside this li
        const closingSpan = item.locator('.//span/span[last()]');
        return await closingSpan.textContent();
      }
    }
    return null;
  }
}