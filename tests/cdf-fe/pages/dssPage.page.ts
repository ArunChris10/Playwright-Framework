import { Page } from "@playwright/test";

export class dssPage {

  private readonly page: Page;
  private readonly urlEndpoint = process.env.cdfAppBaseURL + "/";


  constructor(page: Page) {
    this.page = page;
  }

  async openPublishDSSModal() {
    await this.page.getByTitle('Publish Data to Consumption').locator('#resync_btn').click();
  }

  async populatePublishDSSModal(options, slot) {
    for (let option of options) {
      await this.page.getByText(option).click();
    }
    await this.page.getByLabel('Publish ', { exact: false }).getByLabel('', { exact: true }).selectOption(slot);
    await this.page.getByRole('button', { name: 'Publish' }).click();
  }

  async waitForPublishDSS() {
    await this.page.getByText('Sync UFM started').isVisible();
    await this.page.waitForTimeout(30000);
  }


  async navigate() {
    await this.page.goto(this.urlEndpoint, {
      timeout: 500000,
    });
  }
}
