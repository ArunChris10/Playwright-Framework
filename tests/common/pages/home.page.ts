import { Locator, Page, expect } from "@playwright/test";
export class Home {
  readonly page: Page;
  readonly pageHeading: Locator
  readonly menu: Locator

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = this.page.getByText('IBG');
    this.menu = this.page.getByLabel("menu")

  }

  async open(menuOption: string) {
    await this.page.getByRole("tab", { name: menuOption }).click();
  }

  async openMenuitem(menuOption: string) {
    await this.page.getByRole('menuitem', { name: menuOption }).click();
  }

  async checkIfHomepageIsVisible() {
    await expect(this.pageHeading.first()).toBeVisible();
  }

  async checkAlertMessageFor(message: string) {
    await expect(this.page.locator("#root")).toContainText(message);
  }

}