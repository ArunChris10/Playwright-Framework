import { expect, Locator, Page } from "@playwright/test";
import { testData, nodeCrudDialog, filterOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT, TIMEOUT_FE_VISIBLE } from '../constants/timeout.json';
import { LandingPageValidation } from "./landing.page";

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
  }

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
   * Selects a dropdown value and validates it by:
   * 1. Clicking the nth dropdown arrow,
   * 2. Clicking a checkbox with the given label,
   * 3. Clicking the dialog header to close,
   * 4. Checking the value in the associated textbox.
   * @param dropdownIndex Zero-based index of the dropdown arrow to interact with.
   * @param checkboxLabel Label of the checkbox to select.
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
      // For single-select, summary should be exactly the label
      expect(actualText).toBe(checkboxLabel);
    } else {
      // For multi-select, validate the checkbox is checked
      expect(await checkbox.isChecked()).toBeTruthy();
    }

    if(checkboxLabel == filterOptions[0].data.entity.option){
      await checkbox.click();
    }

    // Click whichever dialog header is visible: Create Node, Input, or Calculated
    const headerLocators = [
      this.getByTextValue(nodeCrudDialog.dialogHeaders.createNode),
      this.topBarHeaderDiv.getByText(nodeCrudDialog.dialogHeaders.input),
      this.topBarHeaderDiv.getByText(nodeCrudDialog.dialogHeaders.calculated)
    ];
    let headerClicked = false;
    for (const header of headerLocators) {
      if (await header.isVisible().catch(() => false)) {
        await header.click({ force: true, timeout: TIMEOUT_FE_WAIT });
        headerClicked = true;
        break;
      }
    }
    if (!headerClicked) {
      for (const header of headerLocators) {
        try {
          await header.scrollIntoViewIfNeeded();
          if (await header.isVisible().catch(() => false)) {
            await header.click({ force: true, timeout: TIMEOUT_FE_WAIT });
            headerClicked = true;
            break;
          }
        } catch (e) {}
      }
    }
    if (!headerClicked) {
      throw new Error('No dialog header (Create Node, Input, Calculated) is visible to click.');
    }
  }

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
   * Validates that a field is read-only (disabled).
   * @param fieldLocator Locator for the field to check.
   */
  async validateFieldIsReadOnly(fieldLocator: Locator) {
    await fieldLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const isDisabled = await fieldLocator.isDisabled();
    expect(isDisabled).toBeTruthy();
  }

  /**
   * Validates that a required field cannot be empty.
   * @param textBoxName Name of the text box.
   * @param nodeType Optional node type to determine error count in panel.
   */
  async validateFieldCannotBeEmptyByName(textBoxName: string, nodeType?: string) {
    let input: Locator;
    let expectedErrorMsg: string;

    if (textBoxName === nodeCrudDialog.fields.valueType) {
      input = this.getInputByPlaceholder(textBoxName);
      await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
      await input.fill("");
      expectedErrorMsg = nodeCrudDialog.messages.valueTypeRequired;
    } else if (textBoxName === nodeCrudDialog.fields.calculationText) {
      input = this.getTextInputBox(textBoxName);
      await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      await this.fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "123");
      await input.fill("");
      expectedErrorMsg = nodeCrudDialog.messages.calculationTextRequired;
    } else {
      throw new Error(`Unsupported text box name: ${textBoxName}`);
    }

    const saveButton = this.getByTextValue(nodeCrudDialog.buttons.saveChanges);
    const errorMsgLocator = this.errorMsgLocator(input);
    await errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const errorMsg = await errorMsgLocator.textContent();
    expect(errorMsg?.trim()).toBe(expectedErrorMsg);
    await this.panelErrorLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const panelMsg = await this.panelErrorLocator.textContent();
    expect(panelMsg?.trim()).toBe(nodeCrudDialog.messages.oneError);
    await saveButton.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await saveButton.isDisabled()).toBeTruthy();
  }

  /**
   * Fills a text input box by typing the base node variable name and selecting the first autosuggestion.
   * @param headerText The header text to locate the input box.
   */
  async fillInputBoxWithAutosuggestions(headerText: string) {
    const input = this.getTextInputBox(headerText);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(""); 

    //const inputText = "#" + this.baseNodeVariableName;
    const inputText = nodeCrudDialog.fields.inputChildNode;
    let suggestionAppeared = false;
    for (let retry = 0; retry < 5; retry++) {
      await input.fill(inputText);
      const suggestion = this.suggestionBoxButtons.first();
      if (await suggestion.isVisible({ timeout: TIMEOUT_FE_WAIT }).catch(() => false)) {
        await suggestion.click();
        suggestionAppeared = true;
        break;
      }
      await this.page.waitForTimeout(TIMEOUT_FE_WAIT);
    }
    if (!suggestionAppeared) {
      throw new Error(`Autosuggestion did not appear for node variable name: ${inputText}`);
    }
  }

  /**
   * Fills all required fields in the create node dialog for calculated node type.
   */
  async fillAllRequiredCalculatedNodeTypeFields(
    isCreate: boolean = true
  ) {
    const offset = isCreate ? 1 : 0;
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
    await this.selectAndValidateDropdownField(offset + 0, filterOptions[0].data.month.actuals, true);
    await this.selectAndValidateDropdownField(offset + 1, filterOptions[0].data.channel.option);
    // Dynamically get and select a unique department option
    await this.getUniqueOptionFromDropdown(offset + 2);
    await this.selectAndValidateDropdownField(offset + 2, this.selectedDropdownOption);
    await this.selectAndValidateDropdownField(offset + 3, filterOptions[0].data.entity.option);
    await this.selectAndValidateDropdownField(offset + 4, nodeCrudDialog.fields.causalFunctionValue, true);
    await this.fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "123");
    await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields.aggregationText);
  }

  /**
   * Fills all required fields in the create node dialog for input node type.
   */
  async fillAllRequiredInputNodeTypeFields(isCreate: boolean = true) {
    const offset = isCreate ? 1 : 0;
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
    await this.selectAndValidateDropdownField(offset + 0, filterOptions[0].data.owner.option, true);
    await this.selectAndValidateDropdownField(offset + 1, nodeCrudDialog.fields.viewerValue);
    await this.selectAndValidateDropdownField(offset + 2, filterOptions[0].data.month.actuals, true);
    await this.selectAndValidateDropdownField(offset + 3, filterOptions[0].data.channel.option);
    // Dynamically get and select a unique department option
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
    /*const found = await this.landingPage._verifySearch(
      metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );
    expect(found).toBeFalsy();*/
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
    await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.valueType, nodeType);

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated && nodeCrudDialog.fields.calculationText !== undefined) {
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.metadata);
      await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
      await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.calculationText);
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.ownerEditor).isHidden()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.viewer).isHidden()).resolves.toBeTruthy();
      await this.fillAllRequiredCalculatedNodeTypeFields(isCreate);
    } else if (nodeType === nodeCrudDialog.dialogHeaders.input) {
      await expect(this.getByTextValue(nodeCrudDialog.dialogHeaders.metadata).isHidden()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.ownerEditor).isVisible()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.viewer).isVisible()).resolves.toBeTruthy();
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
    //const deleted = await this.landingPage.filterAndSearchNode(metricNameValue, this.selectedDropdownOption);
    //expect(deleted).toBeFalsy();
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
    await this.validateNodeCreateOrEditFields(nodeType);

    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, "%");
    await this.discardCreateNodeFlow(
      this.getByTextValue(nodeCrudDialog.messages.editingAffectsNodes),
      nodeCrudDialog.fields.metricNameValue
    );

    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(nodeCrudDialog.fields.metricNameValue);
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();

    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, "%");
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
   * Returns the Node Variable Name for the given node
   * @returns {Promise<string>} The Node Variable Name of the node.
   */
  /*async getNodeVariableName(): Promise<string | undefined> {
    const metricNameValue = nodeCrudDialog.fields.metricNameValue;
    const found = await this.landingPage._verifySearch(
      metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );

    if (found) {
      const nodeRow = this.page.getByText(metricNameValue).first();
      await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();
      const nodeVariableInput = this.getFieldInputByLabel(nodeCrudDialog.fields.nodeVariableName);
      await nodeVariableInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      const nodeVariableName = await nodeVariableInput.inputValue();
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.closePanel).click();
      await this.landingPage.searchBox.click();
      await this.landingPage.searchBox.fill("");
      return nodeVariableName?.substring(0, 3);
    }

    // If not found, return undefined
    return undefined;
  }*/

  /**
   * Validates aggregation formula for different scenarios when user creates or edits a node of input or calculated type
   * @param nodeType Node type: "Input" or "Calculated"
   * @param scenario Which scenario to validate
   * @param isCreate Whether the node is being created or edited (Optional)
   */
  async validateAggregationFormulaScenario(
    nodeType: string,
    scenario: number,
    isCreate: boolean = true
  ) {
    if (nodeType === nodeCrudDialog.dialogHeaders.calculated)
      await this.inputsButton.click(); //Deselect inputs button
    else 
      await this.calculationsButton.click(); //Deselect calculations button
    
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    
    if (isCreate) {
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
      await this.selectAndValidateDropdownField(0, nodeType, true);
    } else {
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();
      await this.validateDialogHeaderVisible(nodeType);
    }
    
    let infoMsgLocator: Locator;
    // Info message and input locator based on node type
    if (nodeType === nodeCrudDialog.dialogHeaders.calculated)
     infoMsgLocator = this.getByTextValue(nodeCrudDialog.messages.calculationAggregationMessage).nth(1);
    else
      infoMsgLocator = this.getByTextValue(nodeCrudDialog.messages.calculationAggregationMessage);
    
    await infoMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await infoMsgLocator.isVisible()).toBeTruthy();

    // Prepare aggregation input locator
    const aggregationInput = this.getTextInputBox(nodeCrudDialog.fields.aggregationText);
    await aggregationInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    let suggestionCount: number;

    switch (scenario) {
      case 1:
        await aggregationInput.fill(nodeCrudDialog.fields.inputChildNode);
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBeGreaterThan(0); 
        if (suggestionCount > 0) {
          await this.suggestionBoxButtons.first().click();
        }
        let currentValue = await aggregationInput.inputValue();
        await aggregationInput.fill(`${currentValue} + 123`);
        break;

      case 2:
        await aggregationInput.fill(nodeCrudDialog.fields.inputChildNode);
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBeGreaterThan(0); 
        if (suggestionCount > 0) {
          await this.suggestionBoxButtons.first().click();
        }
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
   * @param scenario Which scenario to validate
   * @param isCreate Whether the node is being created or edited (Optional)
   */
  async validateCalculationFormulaScenario(
    scenario: number,
    isCreate: boolean = true
  ) {
    await this.inputsButton.click(); //Deselect inputs button
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();

    if (isCreate) {
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
      await this.selectAndValidateDropdownField(0, nodeCrudDialog.dialogHeaders.calculated, true);
    } else {
      await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.calculated);
    }

    // Info message and input locator for calculation formula
    const infoMsgLocator = this.getByTextValue(nodeCrudDialog.messages.calculationAggregationMessage).first();
    await infoMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    expect(await infoMsgLocator.isVisible()).toBeTruthy();

    // Prepare calculation input locator
    const calculationInput = this.getTextInputBox(nodeCrudDialog.fields.calculationText);
    await calculationInput.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

    let suggestionCount: number;
    let errorMsgLocator: Locator;
    let errorMsg: string | null;

    switch (scenario) {
      case 1:
        await calculationInput.fill(nodeCrudDialog.fields.inputChildNode);
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBeGreaterThan(0);
        if (suggestionCount > 0) {
          await this.suggestionBoxButtons.first().click();
        }
        let currentValue = await calculationInput.inputValue();
        await calculationInput.fill(`${currentValue} + 123`);
        break;

      case 2:
        await calculationInput.fill(nodeCrudDialog.fields.inputChildNode);
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBeGreaterThan(0);
        if (suggestionCount > 0) {
          await this.suggestionBoxButtons.first().click();
        }
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
        break;

      case 5:
        await calculationInput.fill("");
        await this.page.waitForTimeout(TIMEOUT_FE_VISIBLE);
        suggestionCount = await this.suggestionBoxButtons.count();
        expect(suggestionCount).toBe(0);

        errorMsgLocator = this.errorMsgLocator(calculationInput);
        errorMsgLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
        errorMsg = await errorMsgLocator.textContent();
        expect(errorMsg?.trim()).toBe(nodeCrudDialog.messages.calculationTextRequired);
        break;

      default:
        throw new Error('Invalid scenario number for calculation type validation');
    }
  }

  // Utility to select a unique option each run by reading all dropdown values dynamically
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

    // Click whichever dialog header is visible: Create Node, Input, or Calculated
    const headerLocators = [
      this.getByTextValue(nodeCrudDialog.dialogHeaders.createNode),
      this.topBarHeaderDiv.getByText(nodeCrudDialog.dialogHeaders.input),
      this.topBarHeaderDiv.getByText(nodeCrudDialog.dialogHeaders.calculated)
    ];
    let headerClicked = false;
    for (const header of headerLocators) {
      if (await header.isVisible().catch(() => false)) {
        await header.click({ force: true, timeout: TIMEOUT_FE_WAIT });
        headerClicked = true;
        break;
      }
    }
    if (!headerClicked) {
      for (const header of headerLocators) {
        try {
          await header.scrollIntoViewIfNeeded();
          if (await header.isVisible().catch(() => false)) {
            await header.click({ force: true, timeout: TIMEOUT_FE_WAIT });
            headerClicked = true;
            break;
          }
        } catch (e) {}
      }
    }
    if (!headerClicked) {
      throw new Error('No dialog header (Create Node, Input, Calculated) is visible to click.');
    }

    if (labels.length === 0) throw new Error('No department options found in dropdown');
    const idx = Math.floor(Math.random() * labels.length);
    this.selectedDropdownOption = labels[idx]; 
  }
}