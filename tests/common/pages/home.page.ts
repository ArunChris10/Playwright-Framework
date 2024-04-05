import { Locator, Page, expect } from "@playwright/test";
export class Home {
  readonly page: Page;
  readonly pageHeading: Locator
  readonly menu: Locator

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByText('Intelligent Business Growth');
    this.menu = this.page.getByLabel("menu")

  }

  async open(menuOption: string) {
    await this.menu.click();
    await this.page.getByLabel('Menu', { exact: true }).getByText(menuOption).click();
  }

  async checkIfHomepageIsVisible() {
    await expect(this.pageHeading).toBeVisible();
  }

  async checkAlertMessageFor(message: string) {
    await expect(this.page.locator("#root")).toContainText(message);
  }

}