import { expect, Locator, Page } from "@playwright/test";
import { testData, nodeCrudDialog, filterOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT, TIMEOUT_FE_VISIBLE } from '../constants/timeout.json';
import { LandingPageValidation } from "./landing.page";

/**
 * Page object for Node CRUD operations and validations.
 */
export class NodeCRUDValidation {
  readonly page: Page;
  readonly landingPage: LandingPageValidation;
  readonly dropdownArrow: Locator;
  readonly dropdownArrowOpen: Locator;
  readonly multiSelectTextBox: Locator;
  readonly panel: Locator;
  readonly panelErrorLocator: Locator;
  readonly panelEditLocator: Locator;
  readonly alertLocator: Locator;
  readonly errorMsgLocator: (input: Locator) => Locator;
  readonly textValueLocator: (textbox: Locator) => Locator;
  readonly suggestionBoxButtons: Locator;
  readonly deleteDialogLocator: Locator;
  readonly deleteConfirmationLocator: (deleteDialog: Locator) => Locator;
  readonly deleteTextLocator: (deleteDialog: Locator) => Locator;
  readonly topBarHeaderDiv: Locator;
  readonly baseNodeVariableName: string;
  readonly inputsButton: Locator;
  readonly calculationsButton: Locator;
  readonly checkboxLabelsLocator: Locator;
  readonly checkedCheckboxesLocator: Locator;
  private selectedDropdownOption: string;

  constructor(page: Page, landingPage: LandingPageValidation) {
    this.page = page;
    this.landingPage = landingPage;
    this.dropdownArrow = page.locator(`//span[contains(@class, "multiselect-arrow")]`);
    this.dropdownArrowOpen = page.locator(`//span[contains(@class, "multiselect-arrow open")]`);
    this.multiSelectTextBox = page.locator(`//div[@class="multiselect-box"]`);
    this.panel = page.locator('.flex-row.justify-between.error-panel-info');
    this.panelErrorLocator = page.locator('.flex-row.justify-between.error-panel-info > span');
    this.panelEditLocator = page.locator('.flex-row.justify-between.error-panel-info > span > div');
    this.alertLocator = page.locator('.Alert-module_contentContainer__U-5Wu');
    this.textValueLocator = (textbox: Locator) => textbox.locator(':scope > span:first-child');
    this.errorMsgLocator = (input: Locator) => input.locator('xpath=parent::div/following-sibling::div/span');
    this.suggestionBoxButtons = page.locator('.suggestion-box > div:nth-child(2) > div > button:not([disabled])');
    this.deleteDialogLocator = page.getByRole('dialog');
    this.deleteConfirmationLocator = (deleteDialog: Locator) => deleteDialog.locator('h2');
    this.deleteTextLocator = (deleteDialog: Locator) => deleteDialog.locator('div:nth-child(2)');
    this.topBarHeaderDiv = page.locator('div[class*="top-bar"] > div');
    this.baseNodeVariableName = process.env.baseNodeName as string;
    this.inputsButton = page.getByRole('button', { name: /\d+\s+Inputs/i });
    this.calculationsButton = page.getByRole('button', { name: /\d+\s+Calculations/i });
    this.checkboxLabelsLocator = page.locator('//input[@type="checkbox"]/parent::label/span');
    this.checkedCheckboxesLocator = page.locator(
      `//div[contains(@class,"multiselect-menu")]//label//input[@type="checkbox" and @checked]`
    );
  }

  // --- Locator utilities ---

  /**
   * Returns a locator for a button with the given aria-label.
   * @param ariaLabel The aria-label of the button.
   */
  getButtonByAriaLabel(ariaLabel: string): Locator {
    return this.page.locator(`button[aria-label="${ariaLabel}"]`);
  }

  /**
   * Returns a locator for an input with the given placeholder.
   * @param placeholder The placeholder attribute of the input box.
   */
  getInputByPlaceholder(placeholder: string): Locator {
    return this.page.locator(`input[placeholder="${placeholder}"]`);
  }

  /**
   * Returns a locator for a text element with the given value.
   * @param textValue The text value to search for.
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
   * Returns a locator for a multiselect title by its text.
   * @param text The visible text of the multiselect title.
   */
  getMultiSelectTitleByText(text: string): Locator {
    return this.page.locator(`//div[contains(@class,"multiselect-title") and normalize-space(text())="${text}"]`);
  }

  /**
   * Returns the locator for a field input by its label (Metric ID or Node Variable Name).
   * @param label The label for the field.
   */
  getFieldInputByLabel(label: string): Locator {
    return this.page.locator(`//div[text()="${label}"]/following-sibling::div//div//div//input`);
  }

  /**
   * Returns a locator for the granularity error message for a given field type.
   * This targets the error span after the specific field header.
   * @param fieldType The key for the field in nodeCrudDialog.fields (e.g., "calculationText" or "aggregationText").
   */
  getGranularityErrorMsgLocator(fieldType: string): Locator {
    return this.page.locator(
      `//div[text()="${nodeCrudDialog.fields[fieldType]}"]/following-sibling::span[contains(@class,"color-danger") and contains(@class,"text-sm")]`
    );
  }

  // --- Dialog header utility ---

  /**
   * Validates the visibility of the dialog header with the given text.
   * @param headerText The text of the dialog header to verify.
   */
  async validateDialogHeaderVisible(headerText: string) {
    let headerLocator: Locator;
    if (
      headerText === nodeCrudDialog.dialogHeaders.input ||
      headerText === nodeCrudDialog.dialogHeaders.calculated
    ) {
      headerLocator = this.topBarHeaderDiv.getByText(headerText);
    } else {
      headerLocator = this.getByTextValue(headerText);
    }
    await headerLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await headerLocator.isVisible()).toBeTruthy();
  }

  /**
   * Clicks the first visible dialog header (Create Node, Input, Calculated).
   */
  private async clickFirstVisibleDialogHeader() {
    const headerLocators = [
      this.getByTextValue(nodeCrudDialog.dialogHeaders.createNode),
      this.topBarHeaderDiv.getByText(nodeCrudDialog.dialogHeaders.input),
      this.topBarHeaderDiv.getByText(nodeCrudDialog.dialogHeaders.calculated)
    ];
    for (const header of headerLocators) {
      if (await header.isVisible().catch(() => false)) {
        await header.click({ force: true, timeout: TIMEOUT_FE_WAIT });
        return;
      }
    }
    for (const header of headerLocators) {
      try {
        await header.scrollIntoViewIfNeeded();
        if (await header.isVisible().catch(() => false)) {
          await header.click({ force: true, timeout: TIMEOUT_FE_WAIT });
          return;
        }
      } catch (e) {}
    }
    throw new Error('No dialog header (Create Node, Input, Calculated) is visible to click.');
  }

  // --- Field validation utilities ---

  // Utility to validate a field is read-only
  async validateFieldIsReadOnly(fieldLocator: Locator) {
    await fieldLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await fieldLocator.isDisabled()).toBeTruthy();
  }

  /**
   * Validates that a required field cannot be empty.
   * @param textBoxName Name of the text box.
   * @param nodeType Optional node type to determine error count in panel.
   */
  async validateFieldCannotBeEmptyByName(textBoxName: string, nodeType?: string, isCreate: boolean = true) {
    let input: Locator;
    let expectedErrorMsg: string;

    if (textBoxName === nodeCrudDialog.fields.valueType) {
      input = this.getInputByPlaceholder(textBoxName);
      await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      await this.validateFieldIsReadOnly(input);
      return; 
    } else if (textBoxName === nodeCrudDialog.fields.calculationText) {
      input = this.getTextInputBox(textBoxName);
      await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      await this.fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "123");
      await input.fill("");
      expectedErrorMsg = nodeCrudDialog.messages.calculationTextRequired;
    } else if (textBoxName === nodeCrudDialog.fields.ownerEditor) {
      const ownerDropdownIndex = isCreate ? 1 : 0;
      const dropdownArrow = this.dropdownArrow.nth(ownerDropdownIndex);
      if (await this.dropdownArrowOpen.nth(ownerDropdownIndex).isHidden()) {
        await dropdownArrow.click();
      }
      const checkedCount = await this.checkedCheckboxesLocator.count();
      for (let i = 0; i < checkedCount; i++) {
        await this.checkedCheckboxesLocator.nth(i).click();
      }
      await this.clickFirstVisibleDialogHeader();
      input = this.multiSelectTextBox.nth(ownerDropdownIndex);
      expectedErrorMsg = nodeCrudDialog.messages.ownerRequired;
    } else {
      throw new Error(`Unsupported text box name: ${textBoxName}`);
    }

    const errorMsgLocator = this.errorMsgLocator(input);
    await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const errorMsg = await errorMsgLocator.textContent();
    expect(errorMsg?.trim()).toBe(expectedErrorMsg);

    await this.validatePanelErrorAndSaveDisabled();
  }

  // --- Dropdown utilities ---

  /**
   * Selects a dropdown value and validates it.
   */
  async selectAndValidateDropdownField(dropdownIndex: number, checkboxLabel: string, isSingleSelect: boolean = false) {
    const dropdownArrow = this.dropdownArrow.nth(dropdownIndex);
    if (await this.dropdownArrowOpen.nth(dropdownIndex).isHidden()) {
      await dropdownArrow.click();
    }
    const checkbox = this.getCheckboxByLabel(checkboxLabel);
    await checkbox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
    const textbox = this.multiSelectTextBox.nth(dropdownIndex);
    const textValueLocator = this.textValueLocator(textbox);
    const actualText = await textValueLocator.textContent();
    if (isSingleSelect) {
      expect(actualText).toBe(checkboxLabel);
    } else {
      expect(await checkbox.isChecked()).toBeTruthy();
    }
    if (checkboxLabel === filterOptions[0].data.entity.option) {
      await checkbox.click();
    }
    await this.clickFirstVisibleDialogHeader();
  }

  /**
   * Gets a unique dropdown option and stores it for reuse.
   */
  private async getUniqueOptionFromDropdown(dropdownIndex: number) {
    const dropdownArrow = this.dropdownArrow.nth(dropdownIndex);
    if (await this.dropdownArrowOpen.nth(dropdownIndex).isHidden()) {
      await dropdownArrow.click();
    }
    const count = await this.checkboxLabelsLocator.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const label = await this.checkboxLabelsLocator.nth(i).textContent();
      if (label && label.trim()) {
        labels.push(label.trim());
      }
    }
    await this.clickFirstVisibleDialogHeader();
    if (labels.length === 0) throw new Error('No department options found in dropdown');
    const idx = Math.floor(Math.random() * labels.length);
    this.selectedDropdownOption = labels[idx];
  }

  // --- Input utilities ---

  /**
   * Fills the input with the given value and validates the value is set.
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
   * Fills the input with the given value and validates the value is set.
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
   * Fills a text input box by typing the base node variable name and selecting the first autosuggestion.
   * @param headerText The header text to locate the input box.
   */
  async fillInputBoxWithAutosuggestions(headerText: string) {
    const input = this.getTextInputBox(headerText);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(""); 

    const inputText = nodeCrudDialog.fields.inputChildNode;
    let suggestionAppeared = false;
    for (let retry = 0; retry < 5; retry++) {
      await input.fill(inputText);
      const panelPortalContent = this.page.locator('div.PanelPortal-module_content__2C73t');
      await panelPortalContent.evaluate((el: HTMLElement) => {
        el.scrollTop = 0; 
        el.scrollBy(0, 200); 
      });
      const suggestion = this.suggestionBoxButtons.first();
      if (await suggestion.isVisible({ timeout: 1000 }).catch(() => false)) {
        await suggestion.scrollIntoViewIfNeeded();
        await suggestion.click();
        suggestionAppeared = true;
        break;
      }
      await this.page.waitForTimeout(500); 
    }
    if (!suggestionAppeared) {
      throw new Error(`Autosuggestion did not appear for node variable name: ${inputText}`);
    }
  }

  // --- Node creation and validation flows ---

  /**
   * Fills all required fields in the create node dialog for calculated node type.
   */
  async fillAllRequiredCalculatedNodeTypeFields(isCreate: boolean = true) {
    const offset = isCreate ? 1 : 0;
    
    const valueTypeInput = this.getInputByPlaceholder(nodeCrudDialog.fields.valueType);
    await this.validateFieldIsReadOnly(valueTypeInput);
    await this.selectAndValidateDropdownField(offset + 0, filterOptions[0].data.month.actuals, true);
    await this.selectAndValidateDropdownField(offset + 1, filterOptions[0].data.channel.option);
    await this.getUniqueOptionFromDropdown(offset + 2);
    await this.selectAndValidateDropdownField(offset + 2, this.selectedDropdownOption);
    await this.selectAndValidateDropdownField(offset + 3, filterOptions[0].data.entity.option);
    await this.selectAndValidateDropdownField(offset + 4, nodeCrudDialog.fields.causalFunctionValue, true);
    await this.fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "123");
    await this.fillAndValidateTextInputBox(nodeCrudDialog.fields.aggregationText,"123");
  }

  /**
   * Fills all required fields in the create node dialog for input node type.
   */
  async fillAllRequiredInputNodeTypeFields(isCreate: boolean = true) {
    const offset = isCreate ? 1 : 0;
    
    const valueTypeInput = this.getInputByPlaceholder(nodeCrudDialog.fields.valueType);
    await this.validateFieldIsReadOnly(valueTypeInput);
    await this.selectAndValidateDropdownField(offset + 0, filterOptions[0].data.owner.option, true);
    await this.selectAndValidateDropdownField(offset + 1, nodeCrudDialog.fields.viewerValue);
    await this.selectAndValidateDropdownField(offset + 2, filterOptions[0].data.month.actuals, true);
    await this.selectAndValidateDropdownField(offset + 3, filterOptions[0].data.channel.option);
    await this.getUniqueOptionFromDropdown(offset + 4);
    await this.selectAndValidateDropdownField(offset + 4, this.selectedDropdownOption);
    await this.selectAndValidateDropdownField(offset + 5, filterOptions[0].data.entity.option);
    await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields.aggregationText);
  }

  /**
   * Handles the discard flow and validate that the node is not created.
   * @param headerLocator Locator for the dialog header.
   * @param metricNameValue The metric name value to verify node is not created.
   */
  async discardCreateNodeFlow(headerLocator: Locator, metricNameValue: string) {
    await this.getByTextValue(nodeCrudDialog.buttons.discard).click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.closePanel).click();
    const isDialogClosed = headerLocator ? !(await headerLocator.isVisible().catch(() => false)) : true;
    expect(isDialogClosed).toBeTruthy();
  }

  /**
   * Handles the save flow and validates that the node is created and alert is shown.
   * @param metricNameValue The metric name value to verify node is created.
   */
  async saveCreateNodeFlow(metricNameValue: string, isCreate: boolean = true) {
    const saveButton = this.getByTextValue(nodeCrudDialog.buttons.saveChanges);
    await saveButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await expect(saveButton).toBeEnabled({ timeout: TIMEOUT_FE_WAIT });
    await saveButton.click();
    await this.alertLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const alertMsg = await this.alertLocator.textContent();
    if (isCreate) {
      expect(alertMsg?.trim()).toBe(metricNameValue + " " + nodeCrudDialog.messages.createAlertMessage);
    } else {
      expect(alertMsg?.trim()).toBe(metricNameValue + " " + nodeCrudDialog.messages.editAlertMessage);
    }
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.closeAlert).click();
    const created = await this.landingPage._verifySearch(
      metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );
    expect(created).toBeTruthy();
  }

  /**
   * Creates a node of the given type and returns the metric name value.
   * @param nodeType The type of node to create ("Input" or "Calculated")
   */
    async createNodeVariant(nodeType: string){
    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(nodeCrudDialog.fields.metricNameValue);
    const found = await this.landingPage._verifySearch(
      nodeCrudDialog.fields.metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );

    if (!found) {
      throw new Error(`Base node "${nodeCrudDialog.fields.metricNameValue}" not found. Please ensure it exists before running this test.`);
    }

    const nodeRow = this.page.getByText(nodeCrudDialog.fields.metricNameValue).first();
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
    await this.selectAndValidateDropdownField(0, nodeType, true);

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated) {
      await this.fillAllRequiredCalculatedNodeTypeFields();
    } else {
      await this.fillAllRequiredInputNodeTypeFields();
    }
    await this.saveCreateNodeFlow(nodeCrudDialog.fields.metricNameValue);
  }

    /**
   * Performs all field and UI validations for node creation and edit.
   * @param nodeType The node type to create or edit.
   */
  async validateNodeCreateOrEditFields(
    nodeType: string,
    isCreate: boolean = false
  ) {
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.granularity);

    if (isCreate && nodeType) {
      await this.selectAndValidateDropdownField(0, nodeType, true);
    }

    await this.validateFieldIsReadOnly(this.getInputByPlaceholder(nodeCrudDialog.fields.metricName));
    await this.validateFieldIsReadOnly(this.getFieldInputByLabel(nodeCrudDialog.fields.metricId));
    await this.validateFieldIsReadOnly(this.getFieldInputByLabel(nodeCrudDialog.fields.nodeVariableName));
    await this.validateFieldIsReadOnly(this.getInputByPlaceholder(nodeCrudDialog.fields.valueType));
    await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.valueType, nodeType);
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.metadata);
    
    if (nodeType === nodeCrudDialog.dialogHeaders.calculated && nodeCrudDialog.fields.calculationText !== undefined) {
      await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.calculationText);
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.ownerEditor).isHidden()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.viewer).isHidden()).resolves.toBeTruthy();
      await this.fillAllRequiredCalculatedNodeTypeFields(isCreate);
    } else if (nodeType === nodeCrudDialog.dialogHeaders.input) {
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.ownerEditor).isVisible()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.viewer).isVisible()).resolves.toBeTruthy();
      await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.ownerEditor);
      await this.fillAllRequiredInputNodeTypeFields(isCreate);
    }
  }

  /**
   * Validates the delete confirmation dialog and cancel flow for a node.
   * @param metricNameValue The metric name value of the node to validate delete for.
   */
  async validateDeleteDialogAndCancel(metricNameValue: string) {
    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(metricNameValue);
    const nodeRow = this.page.getByText(metricNameValue).first();
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.delete.toLowerCase()).click();
    await this.deleteDialogLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const confirmationText = await this.deleteConfirmationLocator(this.deleteDialogLocator);
    await expect(confirmationText).toHaveText(nodeCrudDialog.deleteConfirmation.message);
    const deleteDialogText = await this.deleteTextLocator(this.deleteDialogLocator);
    const subMsg1 = nodeCrudDialog.deleteConfirmation.subMessage1;
    const subMsg2 = nodeCrudDialog.deleteConfirmation.subMessage2;
    const subMsg3 = nodeCrudDialog.deleteConfirmation.subMessage3;

    const textContent = await deleteDialogText.textContent();

    if (textContent?.includes(subMsg1)) {
      expect(textContent).toContain(subMsg1);
    } else if (subMsg2 && subMsg3 && textContent?.includes(subMsg2) && textContent.includes(subMsg3)) {
      expect(textContent).toContain(subMsg2);
      expect(textContent).toContain(subMsg3);
    } else {
      throw new Error('Delete dialog text did not match any expected submessages.');
    }

    const cancelButton = this.getByTextValue(nodeCrudDialog.buttons.cancel);
    await cancelButton.click();
    await this.deleteDialogLocator.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT });
    await this.landingPage.searchBox.fill(metricNameValue);
    const nodeRowAfterCancel = this.page.getByText(metricNameValue).first();
    await nodeRowAfterCancel.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    const stillExists = await this.landingPage._verifySearch(
      metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );
    expect(stillExists).toBeTruthy();
  }

  /**
   * Deletes a node by its metric name value.
   * @param metricNameValue The metric name value of the node to delete.
   */
  async deleteNode(metricNameValue: string) {
    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(metricNameValue);
    const nodeRow = this.page.getByText(metricNameValue).first();
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.delete.toLowerCase()).click();
    await this.deleteDialogLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const confirmDeleteButton = this.getByTextValue(nodeCrudDialog.buttons.delete);
    await confirmDeleteButton.click();
    await this.deleteDialogLocator.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT });
    await this.alertLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const alertMsg = await this.alertLocator.textContent();
    expect(alertMsg?.trim()).toBe(metricNameValue + " " + nodeCrudDialog.messages.deleteAlertMessage);
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.closeAlert).click();
  }

  /**
   * Orchestrates creation of a node and deletion as clean up.
   * @param nodeType The node type to create.
   */
  async validateCreateNodeFlow(nodeType: string) {
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
    await this.validateNodeCreateOrEditFields(nodeType, true);

    const headerLocator = this.getByTextValue(nodeCrudDialog.dialogHeaders.createNode);
    await this.discardCreateNodeFlow(headerLocator, nodeCrudDialog.fields.metricNameValue);
    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill("");

    await this.createNodeVariant(nodeType);

    await this.deleteNode(nodeCrudDialog.fields.metricNameValue);
  }

  /**
   * Orchestrates editing of a node after creation.
   * @param nodeType The node type to create and delete.
   */
  async validateEditNodeFlow(nodeType: string) {
    await this.createNodeVariant(nodeType);
    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(nodeCrudDialog.fields.metricNameValue);
    const nodeRow = this.page.getByText(nodeCrudDialog.fields.metricNameValue).first();
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();

    if (nodeType === nodeCrudDialog.dialogHeaders.input) {
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.input);
    } else if (nodeType === nodeCrudDialog.dialogHeaders.calculated) {
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.calculated);
    }
    await this.validateDialogHeaderVisible(nodeCrudDialog.messages.editingAffectsNodes);

    const saveButton = this.getByTextValue(nodeCrudDialog.buttons.saveChanges);
    const discardButton = this.getByTextValue(nodeCrudDialog.buttons.discard);
    await saveButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await discardButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await saveButton.isDisabled()).toBeTruthy();
    expect(await discardButton.isEnabled()).toBeTruthy();
    
    await this.validateFieldIsReadOnly(this.getFieldInputByLabel(nodeCrudDialog.fields.nodeVariableName));
    await this.validateFieldIsReadOnly(this.getFieldInputByLabel(nodeCrudDialog.fields.metricName));
    const valueTypeInput = this.getInputByPlaceholder(nodeCrudDialog.fields.valueType);
    await this.validateFieldIsReadOnly(valueTypeInput);
    await this.validateNodeCreateOrEditFields(nodeType);

    const channelDropdownIndex = nodeType === nodeCrudDialog.dialogHeaders.input ? 3 : 1;
    await this.selectAndValidateDropdownField(channelDropdownIndex, filterOptions[0].data.channel.optionValue);

    await this.discardCreateNodeFlow(
      this.getByTextValue(nodeCrudDialog.messages.editingAffectsNodes),
      nodeCrudDialog.fields.metricNameValue
    );

    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(nodeCrudDialog.fields.metricNameValue);
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();

    await this.validateFieldIsReadOnly(valueTypeInput);
    await this.selectAndValidateDropdownField(channelDropdownIndex, filterOptions[0].data.channel.optionValue);

    await this.saveCreateNodeFlow(nodeCrudDialog.fields.metricNameValue, false);

    await this.deleteNode(nodeCrudDialog.fields.metricNameValue);
  }

  /**
   * Creates a node, validates the delete dialog (including cancel), and then deletes the node.
   * @param nodeType The node type to create and delete.
   */
  async validateDeleteNodeFlow(nodeType: string) {
    await this.createNodeVariant(nodeType);
    await this.validateDeleteDialogAndCancel(nodeCrudDialog.fields.metricNameValue);
    await this.deleteNode(nodeCrudDialog.fields.metricNameValue);
  }

  /**
   * Validates aggregation formula for different scenarios when user creates or edits a node of input or calculated type.
   * For calculated type: aggregation formula is autosuggestion if causal function is not selected, free text if selected.
   * For input type: aggregation formula is always autosuggestion.
   * @param nodeType "Calculated" or "Input"
   * @param scenario Scenario number for validation
   * @param isCreate true for create flow, false for edit flow
   */
  async validateAggregationFormulaScenario(
    nodeType: string,
    scenario: number,
    isCreate: boolean = true
  ) {
    if (nodeType === nodeCrudDialog.dialogHeaders.calculated)
      await this.inputsButton.click();
    else 
      await this.calculationsButton.click();

    await this.openNodeDialogAndValidateHeaders(isCreate, nodeType);

    const infoMsgLocator = this.getByTextValue(nodeCrudDialog.messages.calculationAggregationMessage).first();
    await infoMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await infoMsgLocator.isVisible()).toBeTruthy();

    const aggregationInput = this.getTextInputBox(nodeCrudDialog.fields.aggregationText);
    await aggregationInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    let suggestionCount: number;

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated) {
      const causalFunctionDropdownIndex = isCreate ? 5 : 4;
      const causalFunctionArrow = this.dropdownArrow.nth(causalFunctionDropdownIndex);
      if (await this.dropdownArrowOpen.nth(causalFunctionDropdownIndex).isHidden()) {
        await causalFunctionArrow.click();
      }
      const checkedCount = await this.checkedCheckboxesLocator.count();
      if (checkedCount > 0) {
        for (let i = 0; i < checkedCount; i++) {
          await this.checkedCheckboxesLocator.nth(i).click();
        }
        await this.clickFirstVisibleDialogHeader();
      }
    }
    
    await aggregationInput.fill(nodeCrudDialog.fields.inputChildNode);
    await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
    suggestionCount = await this.suggestionBoxButtons.count();
    expect(suggestionCount).toBeGreaterThan(0);
    if (suggestionCount > 0) {
      await this.suggestionBoxButtons.first().click();
    }

    switch (scenario) {
      case 1:
        let currentValue = await aggregationInput.inputValue();
        await aggregationInput.fill(`${currentValue} + 123`);
        expect(await aggregationInput.inputValue()).toBe(`${currentValue} + 123`);
        break;
      case 2:
        const actualValue = await aggregationInput.inputValue();
        const expectedSubstring = nodeCrudDialog.fields.inputChildNode.substring(1);
        expect(actualValue.toLowerCase()).toContain(expectedSubstring.toLowerCase());
        break;
      case 3:
        await aggregationInput.fill('123 * 10');
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);
        break;
      case 4:
        await aggregationInput.fill('#T');
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);

        await aggregationInput.fill('#To');
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);

        const errorMsgLocator = this.errorMsgLocator(aggregationInput);
        await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
        const errorMsg = await errorMsgLocator.textContent();
        expect(errorMsg?.trim()).toBe(nodeCrudDialog.messages.aggregationInvalidMessage);
        await this.validatePanelErrorAndSaveDisabled();
        break;
      case 5:
        await aggregationInput.fill("");
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);
        break;
      default:
        throw new Error('Invalid scenario number for aggregation type validation');
    }
  }

  /**
   * Validates calculation formula for different scenarios when user creates or edits a node of calculated type.
   * For calculated type: calculation formula is autosuggestion if causal function is not selected, free text if selected.
   * @param scenario Scenario number for validation
   * @param isCreate true for create flow, false for edit flow
   */
  async validateCalculationFormulaScenario(
    scenario: number,
    isCreate: boolean = true
  ) {
    await this.inputsButton.click();
    await this.openNodeDialogAndValidateHeaders(isCreate, nodeCrudDialog.dialogHeaders.calculated);

    const infoMsgLocator = this.getByTextValue(nodeCrudDialog.messages.calculationAggregationMessage).first();
    await infoMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await infoMsgLocator.isVisible()).toBeTruthy();

    const calculationInput = this.getTextInputBox(nodeCrudDialog.fields.calculationText);
    await calculationInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    let suggestionCount: number;
    let errorMsgLocator: Locator;
    let errorMsg: string | null;

    const causalFunctionDropdownIndex = isCreate ? 5 : 4;
    const causalFunctionArrow = this.dropdownArrow.nth(causalFunctionDropdownIndex);
    if (await this.dropdownArrowOpen.nth(causalFunctionDropdownIndex).isHidden()) {
      await causalFunctionArrow.click();
    }
    const checkedCount = await this.checkedCheckboxesLocator.count();
    if (checkedCount > 0) {
      for (let i = 0; i < checkedCount; i++) {
        await this.checkedCheckboxesLocator.nth(i).click();
      }
      await this.clickFirstVisibleDialogHeader();
    }
    
    await calculationInput.fill(nodeCrudDialog.fields.inputChildNode);
    await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
    suggestionCount = await this.suggestionBoxButtons.count();
    expect(suggestionCount).toBeGreaterThan(0);
    if (suggestionCount > 0) {
      await this.suggestionBoxButtons.first().click();
    }

    switch (scenario) {
      case 1:
        let currentValue = await calculationInput.inputValue();
        await calculationInput.fill(`${currentValue} + 123`);
        expect(await calculationInput.inputValue()).toBe(`${currentValue} + 123`);
        break;
      case 2:
        const actualValue = await calculationInput.inputValue();
        const expectedSubstring = nodeCrudDialog.fields.inputChildNode.substring(1);
        expect(actualValue.toLowerCase()).toContain(expectedSubstring.toLowerCase());
        break;
      case 3:
        await calculationInput.fill('123 * 10');
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);
        break;
      case 4:
        await calculationInput.fill('#T');
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);

        await calculationInput.fill('#To');
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);

        errorMsgLocator = this.errorMsgLocator(calculationInput);
        await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
        errorMsg = await errorMsgLocator.textContent();
        expect(errorMsg?.trim()).toBe(nodeCrudDialog.messages.calculationInvalidMessage);
        await this.validatePanelErrorAndSaveDisabled();
        break;
      case 5:
        await calculationInput.fill("");
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);

        errorMsgLocator = this.errorMsgLocator(calculationInput);
        await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
        errorMsg = await errorMsgLocator.textContent();
        expect(errorMsg?.trim()).toBe(nodeCrudDialog.messages.calculationTextRequired);
        await this.validatePanelErrorAndSaveDisabled();
        break;
      default:
        throw new Error('Invalid scenario number for calculation type validation');
    }
  }

  /**
   * Validates that the child node added in calculation or aggregation formula field
   * has the same granularity as the parent node.
   * @param nodeType "Calculated" or "Input"
   * @param fieldType "calculationText" or "aggregationText"
   * @param isCreate true for create flow, false for edit flow
   */
  async validateParentChildGranularity(nodeType: string, fieldType: string, isCreate: boolean = true) {
    let inputLocator: any;

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated)
      await this.inputsButton.click();
    else 
      await this.calculationsButton.click();

    await this.openNodeDialogAndValidateHeaders(isCreate, nodeType);

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated) {
      const causalFunctionDropdownIndex = isCreate ? 5 : 4;
      const causalFunctionArrow = this.dropdownArrow.nth(causalFunctionDropdownIndex);
      if (await this.dropdownArrowOpen.nth(causalFunctionDropdownIndex).isHidden()) {
        await causalFunctionArrow.click();
      }
      const checkedCount = await this.checkedCheckboxesLocator.count();
      for (let i = 0; i < checkedCount; i++) {
        await this.checkedCheckboxesLocator.nth(i).click();
      }
      await this.clickFirstVisibleDialogHeader();
      inputLocator = this.getTextInputBox(nodeCrudDialog.fields.calculationText);
      await inputLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      inputLocator.fill("123");
    }

    await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields[fieldType]);
    inputLocator = this.getTextInputBox(nodeCrudDialog.fields[fieldType]);
    await inputLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const selectedNode = await inputLocator.inputValue();

    const entityDropdownIndex = isCreate
      ? (nodeType === nodeCrudDialog.dialogHeaders.calculated ? 4 : 6)
      : (nodeType === nodeCrudDialog.dialogHeaders.calculated ? 3 : 5);
    await this.getUniqueOptionFromDropdown(entityDropdownIndex);
    await this.selectAndValidateDropdownField(entityDropdownIndex, this.selectedDropdownOption);

    const expectedErrorMsg = nodeCrudDialog.messages.parentChildGranularity + selectedNode;
    const granularityErrorMsgLocator = this.getGranularityErrorMsgLocator(fieldType);
    await granularityErrorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const actualErrorMsg = await granularityErrorMsgLocator.textContent();
    expect(actualErrorMsg?.trim()).toBe(expectedErrorMsg);

    await this.validatePanelErrorAndSaveDisabled();
  }

  /**
   * Validates that the calculation formula field is mandatory for calculated node type.
   * @param isCreate true for create flow, false for edit flow
   */
  async validateCalculationFormulaMandatory(isCreate: boolean = true) {
    await this.inputsButton.click();
    await this.openNodeDialogAndValidateHeaders(isCreate, nodeCrudDialog.dialogHeaders.calculated);

    const calculationInput = this.getTextInputBox(nodeCrudDialog.fields.calculationText);
    await calculationInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await calculationInput.fill("");
    const errorMsgLocator = this.errorMsgLocator(calculationInput);
    await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const errorMsg = await errorMsgLocator.textContent();
    expect(errorMsg?.trim()).toBe(nodeCrudDialog.messages.calculationTextRequired);

    await this.validatePanelErrorAndSaveDisabled();
  }

  /**
   * Validates that the owner field is mandatory for input node type.
   * @param isCreate true for create flow, false for edit flow
   */
  async validateOwnerFieldMandatory(isCreate: boolean = true) {
    await this.calculationsButton.click();
    await this.openNodeDialogAndValidateHeaders(isCreate, nodeCrudDialog.dialogHeaders.input);

    const ownerDropdownIndex = isCreate ? 1 : 0;
    const dropdownArrow = this.dropdownArrow.nth(ownerDropdownIndex);
    if (await this.dropdownArrowOpen.nth(ownerDropdownIndex).isHidden()) {
      await dropdownArrow.click();
    }
    const checkedCount = await this.checkedCheckboxesLocator.count();
    for (let i = 0; i < checkedCount; i++) {
      await this.checkedCheckboxesLocator.nth(i).click();
    }
    await this.clickFirstVisibleDialogHeader();

    const input = this.multiSelectTextBox.nth(ownerDropdownIndex);
    const errorMsgLocator = (input: Locator) => input.locator('xpath=following-sibling::span');
    await errorMsgLocator(input).waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const errorMsg = await errorMsgLocator(input).textContent();
    expect(errorMsg?.trim()).toBe(nodeCrudDialog.messages.ownerRequired);

    await this.validatePanelErrorAndSaveDisabled();
  }

  /**
   * Validates node variant suggestions for calculation/aggregation formula field
   * when causal function is NOT selected (autosuggestions should appear).
   * @param fieldType "calculationText" or "aggregationText"
   * @param isCreate true for create flow, false for edit flow
   */
  async validateCausalFunctionNodeVariants(
    fieldType: string,
    isCreate: boolean = true
  ) {
    await this.inputsButton.click();
    await this.openNodeDialogAndValidateHeaders(isCreate, nodeCrudDialog.dialogHeaders.calculated);

    const causalFunctionDropdownIndex = isCreate ? 5 : 4;
    const causalFunctionArrow = this.dropdownArrow.nth(causalFunctionDropdownIndex);
    if (await this.dropdownArrowOpen.nth(causalFunctionDropdownIndex).isHidden()) {
      await causalFunctionArrow.click();
    }
    const checkedCount = await this.checkedCheckboxesLocator.count();
    if (checkedCount > 0) {
      for (let i = 0; i < checkedCount; i++) {
        await this.checkedCheckboxesLocator.nth(i).click();
      }
      await this.clickFirstVisibleDialogHeader();
    }

    const input = this.getTextInputBox(nodeCrudDialog.fields[fieldType]);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(""); 
    await input.fill(nodeCrudDialog.fields.inputChildNode);
    await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
    const suggestionCount = await this.suggestionBoxButtons.count();
    expect(suggestionCount).toBeGreaterThan(0);
  }

  /**
   * Validates that free text is allowed in calculation/aggregation formula field
   * when causal function IS selected (no autosuggestions should appear).
   * @param fieldType "calculationText" or "aggregationText"
   * @param isCreate true for create flow, false for edit flow
   */
  async validateCausalFunctionFreeText(
    fieldType: string,
    isCreate: boolean = true
  ) {
    await this.inputsButton.click();
    await this.openNodeDialogAndValidateHeaders(isCreate, nodeCrudDialog.dialogHeaders.calculated);

    const causalFunctionDropdownIndex = isCreate ? 5 : 4;
    const causalFunctionArrow = this.dropdownArrow.nth(causalFunctionDropdownIndex);
    if (await this.dropdownArrowOpen.nth(causalFunctionDropdownIndex).isHidden()) {
      await causalFunctionArrow.click();
    }
    const checkedCount = await this.checkedCheckboxesLocator.count();
    if (checkedCount === 0) {
      const firstCheckbox = this.checkboxLabelsLocator.first();
      await firstCheckbox.click();
      await this.clickFirstVisibleDialogHeader();
    }
    // Fill free text and validate no suggestions
    const input = this.getTextInputBox(nodeCrudDialog.fields[fieldType]);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill("");
    await input.fill('Some free text');
    await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
    const suggestionCount = await this.suggestionBoxButtons.count();
    expect(suggestionCount).toBe(0);
  }

  /**
   * Validates error message for invalid node variant when causal function is NOT selected.
   * @param fieldType "calculationText" or "aggregationText"
   * @param isCreate true for create flow, false for edit flow
   */
  async validateCausalFunctionInvalidNodeVariant(
    fieldType: string,
    isCreate: boolean = true
  ) {
    await this.openNodeDialogAndValidateHeaders(isCreate, nodeCrudDialog.dialogHeaders.calculated);

    // Deselect causal function
    const causalFunctionDropdownIndex = isCreate ? 5 : 4;
    const causalFunctionArrow = this.dropdownArrow.nth(causalFunctionDropdownIndex);
    if (await this.dropdownArrowOpen.nth(causalFunctionDropdownIndex).isHidden()) {
      await causalFunctionArrow.click();
    }
    const checkedCount = await this.checkedCheckboxesLocator.count();
    for (let i = 0; i < checkedCount; i++) {
      await this.checkedCheckboxesLocator.nth(i).click();
    }
    await this.clickFirstVisibleDialogHeader();

    const input = this.getTextInputBox(nodeCrudDialog.fields[fieldType]);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill("");

    // Determine expected error messages based on fieldType
    let incompleteErrorMsg: string;
    let invalidNodeErrorMsg: string;
    if (fieldType === "calculationText") {
      incompleteErrorMsg = nodeCrudDialog.messages.calculationInvalidMessage;
      invalidNodeErrorMsg = nodeCrudDialog.messages.calculationInvalidNodeMessage;
    } else if (fieldType === "aggregationText") {
      incompleteErrorMsg = nodeCrudDialog.messages.aggregationInvalidMessage;
      invalidNodeErrorMsg = nodeCrudDialog.messages.aggregationInvalidNodeMessage;
    } else {
      throw new Error(`Unsupported fieldType: ${fieldType}`);
    }

    await input.fill('#T');
    await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
    let errorMsgLocator = this.errorMsgLocator(input);
    await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    let errorMsg = await errorMsgLocator.textContent();
    expect(errorMsg?.trim()).toBe(incompleteErrorMsg);

    await input.fill(nodeCrudDialog.fields.inputChildNode);
    await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
    errorMsgLocator = this.errorMsgLocator(input);
    await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    errorMsg = await errorMsgLocator.textContent();
    expect(errorMsg?.trim()).toBe(invalidNodeErrorMsg);

    await this.validatePanelErrorAndSaveDisabled();
  }

  /**
   * Checks that the error panel is visible and the save button is disabled.
   */
  async validatePanelErrorAndSaveDisabled() {
    await this.panelErrorLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const panelMsg = await this.panelErrorLocator.textContent();
    expect(panelMsg?.trim()).toBe(nodeCrudDialog.messages.oneError);

    const saveButton = this.getByTextValue(nodeCrudDialog.buttons.saveChanges);
    await saveButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await saveButton.isDisabled()).toBeTruthy();
  }

  /**
   * Utility to open the node dialog (add or edit) and validate headers.
   * @param isCreate true for create flow, false for edit flow
   * @param nodeType "Input" or "Calculated"
   */
  async openNodeDialogAndValidateHeaders(isCreate: boolean, nodeType: string) {
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    if (isCreate) {
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
      await this.selectAndValidateDropdownField(0, nodeType, true);
    } else {
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();
      await this.validateDialogHeaderVisible(nodeType);
    }
  }
}