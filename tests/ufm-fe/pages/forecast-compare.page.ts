import { Locator, Page, expect } from "@playwright/test";
export class ForecastComparisonPageFactory {
  readonly page: Page;
  readonly btnCompare: Locator;
  readonly compareDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.btnCompare = page.getByText("Compare");
    this.compareDropdown = page.locator(
      '//div[contains(@class,"KPIPageHeader_toolbarContainer")]'
    );
  }

  async clickOnCompare() {
    await this.btnCompare.click();
  }

  async selectComparisonCheckBox(checkBoxValue: string) {
    const checkBoxValueSelection = await this.page.getByLabel(checkBoxValue, {
      exact: true,
    });
    await checkBoxValueSelection.check();
    await expect(checkBoxValueSelection).toBeChecked();
    await this.page.keyboard.press("Escape");
  }

  async visibilityOfCompareButton() {
    await this.btnCompare.isVisible();
  }

  async visibilityOfCompareDropdown() {
    await this.compareDropdown.isVisible();
  }

  async selectComparisonCheckBoxOnCheck(label: string): Promise<void> {
    const checkBoxLocator = await this.page.getByLabel(label, {
      exact: true,
    });
    await checkBoxLocator.check();
  }

  async selectComparisonCheckBoxOnUnCheck(label: string): Promise<void> {
    const checkBoxLocator = await this.page.getByLabel(label, {
      exact: true,
    });
    await checkBoxLocator.uncheck();
  }

  async isComparisonCheckBoxChecked(label: string): Promise<boolean> {
    const checkBoxLocator = this.page.locator(`text=${label}`);
    return await checkBoxLocator.isChecked(); // Playwright's built-in method to check if a checkbox is selected
  }

  async getSelectedComparisonCheckBoxCount(): Promise<number> {
    return await this.page.$$eval('input[type="checkbox"]:checked', (checkboxes) => checkboxes.length);
  }

  async getCountBesideCompareButton(): Promise<number> {
    // Locate the span element containing the count beside the "Compare" button
    const countLocator = this.page.locator('button:has-text("Compare") .KPIPageHeader_badge__Wtwln');
    // Get the text content of the span and convert it to a number
    const countText = await countLocator.textContent();
    return parseInt(countText || '0', 10); // Default to 0 if countText is null
  }

}
