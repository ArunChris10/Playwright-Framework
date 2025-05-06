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
}
