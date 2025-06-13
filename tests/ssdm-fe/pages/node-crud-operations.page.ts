import { expect, Locator, Page } from "@playwright/test";
import { testData, nodeCrudDialog, filterOptions } from '../testdata/fileName.json';
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';
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
    this.suggestionBoxButtons = page.locator('.suggestion-box > button');
    this.deleteDialogLocator = page.getByRole('dialog');
    this.deleteConfirmationLocator = (deleteDialog: Locator) => deleteDialog.locator('h2');
    this.deleteTextLocator = (deleteDialog: Locator) => deleteDialog.locator('div:nth-child(2)');
    this.topBarHeaderDiv = page.locator('div[class*="top-bar"] > div');
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
      await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields.calculationText, [nodeCrudDialog.fields.token1, nodeCrudDialog.fields.token2]);
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
   * Fills a text input box by typing a value, selecting the first autosuggestion for each token.
   * @param headerText The header text to locate the input box.
   * @param tokens Array of tokens to type and select from autosuggestions.
   */
  async fillInputBoxWithAutosuggestions(headerText: string, tokens: string[]) {
    const input = this.getTextInputBox(headerText);
    await input.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await input.fill(""); 

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      await input.fill(token);

      let suggestionAppeared = false;
      for (let retry = 0; retry < 3; retry++) {
        const suggestion = this.suggestionBoxButtons.first();
        if (await suggestion.isVisible({ timeout: TIMEOUT_FE_WAIT }).catch(() => false)) {
          await suggestion.click();
          suggestionAppeared = true;
          break;
        }
        
        await this.page.waitForTimeout(500);
      }
      if (!suggestionAppeared) {
        throw new Error(`Autosuggestion did not appear for token: ${token}`);
      }

      if (i < tokens.length - 1) {
        await input.fill(' + ');
      }
    }
  }

  /**
   * Fills all required fields in the create node dialog for calculated node type.
   * @param metricNameValue The metric name value.
   */
  async fillAllRequiredCalculatedNodeTypeFields(metricNameValue: string, isCreate: boolean = true) {
    const offset = isCreate ? 1 : 0;
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.metricName, metricNameValue);
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
    await this.selectAndValidateDropdownField(offset + 0, filterOptions[0].data.month.actuals, true);
    await this.selectAndValidateDropdownField(offset + 1, filterOptions[0].data.channel.option);
    await this.selectAndValidateDropdownField(offset + 2, filterOptions[0].data.department.option);
    await this.selectAndValidateDropdownField(offset + 3, filterOptions[0].data.entity.option);
    await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields.calculationText, [nodeCrudDialog.fields.token1, nodeCrudDialog.fields.token2]);
    await this.selectAndValidateDropdownField(offset + 4, nodeCrudDialog.fields.causalFunctionValue, true);
    await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields.aggregationText, [nodeCrudDialog.fields.token1, nodeCrudDialog.fields.token2]);
  }

  /**
   * Fills all required fields in the create node dialog for input node type.
   * @param metricNameValue The metric name value.
   */
  async fillAllRequiredInputNodeTypeFields(metricNameValue: string, isCreate: boolean = true) {
    const offset = isCreate ? 1 : 0;
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.metricName, metricNameValue);
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
    await this.selectAndValidateDropdownField(offset + 0, filterOptions[0].data.owner.option, true);
    await this.selectAndValidateDropdownField(offset + 1, nodeCrudDialog.fields.viewerValue);
    await this.selectAndValidateDropdownField(offset + 2, filterOptions[0].data.month.actuals, true);
    await this.selectAndValidateDropdownField(offset + 3, filterOptions[0].data.channel.option);
    await this.selectAndValidateDropdownField(offset + 4, filterOptions[0].data.department.option);
    await this.selectAndValidateDropdownField(offset + 5, filterOptions[0].data.entity.option);
    await this.fillInputBoxWithAutosuggestions(nodeCrudDialog.fields.aggregationText, [nodeCrudDialog.fields.token1, nodeCrudDialog.fields.token2]);
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
    const found = await this.landingPage._verifySearch(
      metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );
    expect(found).toBeFalsy();
  }

  /**
   * Handles the save flow and validates that the node is created and alert is shown.
   * @param metricNameValue The metric name value to verify node is created.
   */
  async saveCreateNodeFlow(metricNameValue: string) {
    await this.getByTextValue(nodeCrudDialog.buttons.saveChanges).click();
    await this.alertLocator.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const alertMsg = await this.alertLocator.textContent();
    expect(alertMsg?.trim()).toBe(metricNameValue + " " + nodeCrudDialog.messages.createAlertMessage);
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
   * @param metricNameValue (Optional) The metric name value to use. If not provided, a random one is generated.
   * @returns The metric name value of the created node
   */
    async createNode(
    nodeType: string,
    metricNameValue?: string,
  ): Promise<string> {
    const nameValue =
      metricNameValue ?? `${nodeCrudDialog.fields.metricNameValue} ${Math.floor(Math.random() * 100000)}`;
    
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
    await this.selectAndValidateDropdownField(0, nodeType, true);

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated) {
      await this.fillAllRequiredCalculatedNodeTypeFields(nameValue);
    } else {
      await this.fillAllRequiredInputNodeTypeFields(nameValue);
    }
    await this.saveCreateNodeFlow(nameValue);
    return nameValue;
  }

    /**
   * Performs all field and UI validations for node creation and edit.
   * @param nodeType The node type to create or edit.
   * @param metricNameValue The metric name value to use.
   */
  async validateNodeCreateOrEditFields(
    nodeType: string,
    metricNameValue: string,
    isCreate: boolean = false
  ) {
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.granularity);

    if (isCreate && nodeType) {
      await this.selectAndValidateDropdownField(0, nodeType, true);
    }

    await this.validateFieldIsReadOnly(this.getFieldInputByLabel(nodeCrudDialog.fields.metricId));
    await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.valueType, nodeType);

    if (nodeType === nodeCrudDialog.dialogHeaders.calculated && nodeCrudDialog.fields.calculationText !== undefined) {
      await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.metadata);
      await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.valueType, nodeCrudDialog.fields.valueTypeValue);
      await this.validateFieldCannotBeEmptyByName(nodeCrudDialog.fields.calculationText);
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.ownerEditor).isHidden()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.viewer).isHidden()).resolves.toBeTruthy();
      await this.fillAllRequiredCalculatedNodeTypeFields(metricNameValue, isCreate);
    } else if (nodeType === nodeCrudDialog.dialogHeaders.input) {
      await expect(this.getByTextValue(nodeCrudDialog.dialogHeaders.metadata).isHidden()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.ownerEditor).isVisible()).resolves.toBeTruthy();
      await expect(this.getMultiSelectTitleByText(nodeCrudDialog.fields.viewer).isVisible()).resolves.toBeTruthy();
      await this.fillAllRequiredInputNodeTypeFields(metricNameValue, isCreate);
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
    await this.landingPage.searchBox.fill(metricNameValue);
    const deleted = await this.landingPage._verifySearch(
      metricNameValue,
      testData.dataFieldAttributeMetricName,
      true
    );
    expect(deleted).toBeFalsy();
  }

  /**
   * Orchestrates creation of a node and deletion as clean up.
   * @param nodeType The node type to create.
   */
  async validateCreateNodeFlow(nodeType: string) {
    const randomNumber = Math.floor(Math.random() * 100000);
    const metricNameValue = `${nodeCrudDialog.fields.metricNameValue} ${randomNumber}`;

    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.add.toLowerCase()).click();
    await this.validateDialogHeaderVisible(nodeCrudDialog.dialogHeaders.createNode);
    await this.validateNodeCreateOrEditFields(nodeType, metricNameValue,true);

    const headerLocator = this.getByTextValue(nodeCrudDialog.dialogHeaders.createNode);
    await this.discardCreateNodeFlow(headerLocator, metricNameValue);
    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill("");

    const createdMetricName = await this.createNode(nodeType, metricNameValue);

    await this.deleteNode(createdMetricName);
  }

  /**
   * Orchestrates editing of a node after creation.
   * @param nodeType The node type to create and delete.
   */
  async validateEditNodeFlow(nodeType: string) {
    const metricNameValue = await this.createNode(nodeType);

    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(metricNameValue);
    const nodeRow = this.page.getByText(metricNameValue).first();
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
    await this.validateNodeCreateOrEditFields(nodeType, metricNameValue);

    const updatedName1 = `${metricNameValue}_EDIT1`;
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.metricName, updatedName1);
    await this.discardCreateNodeFlow(
      this.getByTextValue(nodeCrudDialog.messages.editingAffectsNodes),
      updatedName1
    );

    await this.landingPage.searchBox.click();
    await this.landingPage.searchBox.fill(metricNameValue);
    await nodeRow.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.more).first().click();
    await this.getButtonByAriaLabel(nodeCrudDialog.buttons.edit.toLowerCase()).click();

    const updatedName2 = `${metricNameValue}_EDIT2`;
    await this.fillAndValidateInputByPlaceholder(nodeCrudDialog.fields.metricName, updatedName2);
    await this.saveCreateNodeFlow(updatedName2);

    await this.deleteNode(updatedName2);
  }

  /**
   * Creates a node, validates the delete dialog (including cancel), and then deletes the node.
   * @param nodeType The node type to create and delete.
   */
  async validateDeleteNodeFlow(nodeType: string) {
    const metricNameValue = await this.createNode(nodeType);
    await this.validateDeleteDialogAndCancel(metricNameValue);
    await this.deleteNode(metricNameValue);
  }
}



