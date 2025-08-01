import { expect, Locator, Page } from "@playwright/test";
import { TIMEOUT_FE_WAIT } from '../constants/timeout.json';

/**
 * Page Object Model for Landing Page Validation.
 * Encapsulates all actions and assertions for the landing page.
 */
export class DriverTreeSettingsDialog {

  // --- Locators ---
  readonly page: Page;
  readonly publishedDriverTree: Locator;
  readonly gridLoader: Locator;
  readonly driverTreeSettingsIcon: Locator;
  readonly driverTreeSettingsDialog: Locator;
  readonly datasetDropdown: Locator;
  readonly defaultDatasetDropdownOption: Locator;
  readonly dataSetOptions: Locator;
  readonly draftVersion: Locator;
  readonly closeButtonDriverTreeSettingDialog: Locator;
  readonly changeLogSection: Locator;
  readonly changeLogTimeStamps: Locator;
  readonly changeLogStats: Locator;
  readonly ViewChangeLogButton: Locator;
  readonly updateDataSetButton: Locator;
  readonly detailedChangeLogDialogHeader: Locator;
  readonly detailedChangeLogDialogCloseBtn: Locator;
  readonly publishedDriverTreeDropdown: Locator;
  readonly republishButton: Locator;
  readonly republishConfirmationMessage: Locator;
  readonly popupCancelButton: Locator;
  readonly popupPublishButton: Locator;
  readonly bannerMessage: Locator;

  // Parameterized XPath generators
  readonly getFilterButtonXPath: (label: string) => string;
  readonly getGridValueXPath: (dataFieldAttribute: string) => string;
  readonly getSortOptionXPath: (sortLabel: string) => string;

  constructor(page: Page) {
    this.page = page;
    this.publishedDriverTree = page.locator(`//header//div[@role="combobox"]`);
    this.gridLoader = page.locator('.MuiCircularProgress-svg');
    this.driverTreeSettingsIcon = page.locator(`//div[@class='ml-1 mr-1']`);
    this.driverTreeSettingsDialog = page.locator('[role="dialog"]');
    this.defaultDatasetDropdownOption = page.locator('//div[text()="Dataset for current View"]/following-sibling::div//span');
    this.datasetDropdown = page.locator(`//h3[text()="Draft Settings" or text()="My View"]/parent::div//div[@id='published-driver-tree']`);
    this.dataSetOptions = page.locator(`[class="version-control-option-text"]`);
    this.draftVersion = page.locator(`//li[text()="Edit"]/following-sibling::li[1]`);
    this.closeButtonDriverTreeSettingDialog = page.locator(`//button[@aria-label='Close Driver Tree V5 Panel']`);
    this.changeLogSection = page.locator(`[class='changelog-content']`);
    this.changeLogTimeStamps = page.locator(`//div[@class='changelog-info']//div[@class='changelog-item']`);
    this.changeLogStats = page.locator(`//div[@class='changelog-stats']//div[@class='changelog-item']`);
    this.ViewChangeLogButton = page.locator(`//button[text()='View Change Log']`);
    this.updateDataSetButton = page.locator(`//button[text()='Update']`);
    this.detailedChangeLogDialogHeader = page.locator(`//h2[text()='Change Log']`);
    this.detailedChangeLogDialogCloseBtn = page.locator(`//button[@aria-label='Change Log']`);
    this.publishedDriverTreeDropdown = page.locator(`//h3[text()="Publish Settings"]/parent::div//div[@id='published-driver-tree']`);
    this.republishButton = page.locator(`//button[text()='Re-Publish']`);
    this.republishConfirmationMessage = page.locator(`(//div[@role="dialog"])[2]//span`);
    this.popupCancelButton = page.locator(`//button[text()='Cancel']`);
    this.popupPublishButton = page.locator(`//button[text()='Publish']`);
    this.bannerMessage= page.locator(`(//div[contains(@class,"Alert-module_alert")]//div)[1]`);
  }

  async getLatestPublishedDriverTreeVersion() {
    await this.gridLoader.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT * 3 });
    await this.publishedDriverTree.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const publishedDriverTreeText = await this.publishedDriverTree.textContent();
    return publishedDriverTreeText?.trim() || '';
  }

  async validateDataSet(expectedDataSet: string) {
    await this.driverTreeSettingsIcon.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.driverTreeSettingsIcon.scrollIntoViewIfNeeded();
    await this.driverTreeSettingsIcon.click();
    await this.driverTreeSettingsDialog.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const dataSetText = await this.defaultDatasetDropdownOption.textContent();
    expect(dataSetText?.trim()?.toLowerCase()).toBe(expectedDataSet.toLowerCase());
    console.log(`Current dataset: ${dataSetText?.trim()}`);
  }

  async validateDataSetDropdownisDisabled() {
    const classAttr = await this.datasetDropdown.getAttribute('class');
    expect(classAttr).toContain('disabled');
  }

  async selectValueFromDataSetDropdown(dataSetOption?: string) {
    const classAttr = await this.datasetDropdown.getAttribute('class');
    expect(classAttr).not.toContain('disabled');
    let defaultDataSet = await this.defaultDatasetDropdownOption.textContent();
    await this.datasetDropdown.click();
    await this.dataSetOptions.nth(0).waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const optionsCount = await this.dataSetOptions.count();
    let selectedOptionText = '';

    if (dataSetOption) {
      for (let i = 0; i < optionsCount; i++) {
        const optionText = await this.dataSetOptions.nth(i).textContent();
        if (optionText?.trim().toLowerCase() === dataSetOption.trim().toLowerCase()) {
          selectedOptionText = optionText ?? '';
          await this.dataSetOptions.nth(i).click();
          break;
        }
      }
    } else {
      for (let i = 0; i < optionsCount; i++) {
        const optionText = await this.dataSetOptions.nth(i).textContent();
        if (optionText?.trim() !== defaultDataSet?.trim()) {
          selectedOptionText = optionText ?? '';
          await this.dataSetOptions.nth(i).click();
          break;
        }
      }
    }

    expect(selectedOptionText?.trim()).toBe(await this.defaultDatasetDropdownOption.textContent());
    await this.updateDataSetButton.click({ force: true });
    await this.driverTreeSettingsDialog.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT });
    await this.gridLoader.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT * 10 });
    await this.page.waitForTimeout(300);
    return selectedOptionText;
  }


  async validateDataSetSelection() {
    let selectedDataSetOption = await this.selectValueFromDataSetDropdown();
    await this.validateDataSet(selectedDataSetOption?.trim() || '');
    console.log(`Selected dataset on update: ${selectedDataSetOption?.trim()}`);
  }

  async revertToDefaultDataSet(defaultDataSet?: string) {
    await this.selectValueFromDataSetDropdown(defaultDataSet);
    console.log(`Reverted to default dataset: ${defaultDataSet}`);
  }

  async closeDriverTreeSettingsDialog() {
    await this.driverTreeSettingsDialog.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.closeButtonDriverTreeSettingDialog.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.closeButtonDriverTreeSettingDialog.click();
    await this.driverTreeSettingsDialog.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT });
  }

  async validateLatestDraftDriverTreeVersion(expectedDraftCreatedOn: string) {
    await this.publishedDriverTree.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.publishedDriverTree.click();
    await this.draftVersion.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.draftVersion.click({ force: true });
    await this.gridLoader.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT * 8 });
    const draftVersion = await this.publishedDriverTree.textContent();
    expect(draftVersion?.trim()).toBe(`Draft - ${expectedDraftCreatedOn}`);
  }

  async validateChangeLog(expectedDraftCreatedOn: string) {
    await this.changeLogSection.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    const timeStampCount = await this.changeLogTimeStamps.count();
    expect(timeStampCount).toBe(2);
    const firstTimeStampText = await this.changeLogTimeStamps.nth(0).textContent();
    expect(firstTimeStampText).toContain(expectedDraftCreatedOn);
    const statsCount = await this.changeLogStats.count();
    expect(statsCount).toBe(3);
    const firstStatText = (await this.changeLogStats.nth(0).textContent())?.toLowerCase() || '';
    expect(firstStatText).toContain('nodes updated');
    const secondStatText = (await this.changeLogStats.nth(1).textContent())?.toLowerCase() || '';
    expect(secondStatText).toContain('nodes created');
    const thirdStatText = (await this.changeLogStats.nth(2).textContent())?.toLowerCase() || '';
    expect(thirdStatText).toContain('nodes deleted');
    await expect(this.ViewChangeLogButton.nth(1)).toBeVisible({ timeout: TIMEOUT_FE_WAIT });
  }

  async validateDetailedChangeLog() {
    await expect(this.ViewChangeLogButton).toBeVisible({ timeout: TIMEOUT_FE_WAIT });
    await this.ViewChangeLogButton.click();
    await this.detailedChangeLogDialogHeader.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.page.click('body', { force: true });
    await this.detailedChangeLogDialogHeader.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT });
    await this.driverTreeSettingsIcon.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.driverTreeSettingsIcon.scrollIntoViewIfNeeded();
    await this.driverTreeSettingsIcon.click();
    await this.driverTreeSettingsDialog.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await expect(this.ViewChangeLogButton.nth(1)).toBeVisible({ timeout: TIMEOUT_FE_WAIT });
    await this.ViewChangeLogButton.nth(1).click();
    await this.detailedChangeLogDialogHeader.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
    await this.detailedChangeLogDialogCloseBtn.click();
  }

  async validatePublishSettings() {
    expect(await this.publishedDriverTreeDropdown).toBeVisible({ timeout: TIMEOUT_FE_WAIT });
  }

  async republishDriverTree() {
    await this.publishedDriverTreeDropdown.click();
    const optionsCount = await this.dataSetOptions.count();
      await this.dataSetOptions.nth(0).click();
      const selectedVersion = await this.publishedDriverTreeDropdown.locator('span').textContent();
      await this.republishButton.click({ force: true });
      await this.republishConfirmationMessage.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      expect(await this.republishConfirmationMessage.textContent()).toContain(selectedVersion);
      expect(await this.popupCancelButton).toBeVisible({ timeout: TIMEOUT_FE_WAIT });
      expect(await this.popupPublishButton).toBeVisible({ timeout: TIMEOUT_FE_WAIT });
      /* await this.popupPublishButton.click({force: true});
      await this.gridLoader.waitFor({ state: 'hidden', timeout: TIMEOUT_FE_WAIT * 10 });
      await this.bannerMessage.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
      expect(await this.bannerMessage.textContent()).toContain('Driver tree version re-published successfully'); 
      console.log("Driver tree republished successfully.");*/
      return selectedVersion;
  }
}