import { expect, Locator, Page } from "@playwright/test";
import { testData } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Logger } from "../../common/fixtures/logger-utils";

export class NodeCRUDValidation {

  readonly page: Page;
  readonly dropdownArrow: Locator;
  readonly dropdownArrowOpen: Locator;
  readonly multiSelectTextBox: Locator;
  readonly metricId: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dropdownArrow = page.locator(`//span[contains(@class, "multiselect-arrow")]`);
    this.dropdownArrowOpen = page.locator(`//span[contains(@class, "multiselect-arrow open")]`);
    this.multiSelectTextBox = page.locator(`//div[@class="multiselect-box"]`);
    this.metricId = this.page.locator(`//div[text()="Metric ID"]/following-sibling::div//div//div//input`);
}

  /**
   * Returns a locator for a button with the given aria-label.
   */
  getButtonByAriaLabel(ariaLabel: string): Locator {
    return this.page.locator(`button[aria-label="${ariaLabel}"]`);
  }

  /**
   * Returns a locator for an input with the given placeholder.
   */
  getInputByPlaceholder(placeholder: string): Locator {
    return this.page.locator(`input[placeholder="${placeholder}"]`);
  }

  /**
   * Returns a locator for a text element with the given value.
   */
  getByTextValue(textValue: string): Locator {
    return this.page.getByText(textValue);
  }

  /**
   * Returns a locator for a checkbox with the given label text.
   * @param label The text label next to the checkbox.
   */
  getCheckboxByLabel(label: string): Locator {
    return this.page.locator(`//input[@type="checkbox" and following-sibling::span[normalize-space(text())="${label}"]]`);
  }

  /**
   * Returns a locator for an input field that comes after a header with the given text.
   * @param headerText The text of the header.
   */
  getTextInputBox(headerText: string): Locator {
    return this.page.locator(`//div[text()="${headerText}"]/following-sibling::div//div//input`);
  }

  /**
   * Clicks on the "More" button, then clicks on the specified action button ("add", "edit", or "delete").
   * @param action The aria-label of the action button to click ("add", "edit", or "delete").
   */
  async clickMoreAndAction(action: "add" | "edit" | "delete") {
    const moreButton = this.getButtonByAriaLabel("More");
    await moreButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await moreButton.click();

    const actionButton = this.getButtonByAriaLabel(action);
    await actionButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await actionButton.click();
  }

  /**
   * Validates the visibility of the dialog header with the given text.
   * @param headerText The text of the dialog header to verify.
   */
  async validateDialogHeaderVisible(headerText: string) {
    const headerLocator = this.getByTextValue(headerText);
    await headerLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await headerLocator.isVisible()).toBeTruthy();
  }

  /**
   * Selects a dropdown value and validates it by:
   * 1. Clicking the nth dropdown arrow,
   * 2. Clicking a checkbox with the given label,
   * 3. Clicking the open dropdown arrow to close,
   * 4. Checking the value in the associated textbox.
   * 
   * @param dropdownIndex - zero-based index of the dropdown arrow to interact with
   * @param checkboxLabel - label of the checkbox to select
   */
  async selectAndValidateDropdownField(dropdownIndex: number,checkboxLabel: string) {

    await this.dropdownArrow.nth(dropdownIndex).click();
    const checkbox = this.getCheckboxByLabel(checkboxLabel);
    await checkbox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await checkbox.click();
    await this.dropdownArrowOpen.nth(dropdownIndex).click();

    const textbox = await this.multiSelectTextBox.nth(dropdownIndex);
    await textbox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const textValueLocator = textbox.locator('xpath=following-sibling::span[1]');
    await textValueLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const value = await textValueLocator.textContent();

    expect(value).toBe(checkboxLabel);
  }

  /**
   * Validate input fields by placeholder:
   * - Fills the input with the given value and validates the value is set.
   * @param placeholder The placeholder attribute of the input box.
   * @param value The value to fill and verify.
   */
  async fillAndValidateInputByPlaceholder(placeholder: string, value: string) {
    const input = this.getInputByPlaceholder(placeholder);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(value);
    const inputValue = await input.inputValue();
    expect(inputValue).toBe(value);
  }

  /**
   * Validate text input boxes (using getTextInputBox):
   * - Fills the input with the given value and validates the value is set.
   * @param headerText The header text to locate the input box.
   * @param value The value to fill and verify.
   */
  async fillAndValidateTextInputBox(headerText: string, value: string) {
    const input = this.getTextInputBox(headerText);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(value);
    const inputValue = await input.inputValue();
    expect(inputValue).toBe(value);
  }

  /**
   * Validates that the Metric ID field is not editable (read-only/disabled).
   */
  async validateMetricIdIsReadOnly() {
    await this.metricId.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const isDisabled = await this.metricId.isDisabled();
    expect(isDisabled).toBeTruthy();
  }
}

