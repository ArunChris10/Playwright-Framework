import { Page, Locator } from "@playwright/test";

export class dssPage {

  private readonly page: Page;
  private readonly syncButtonToOpenModal: Locator;
  private readonly publishSlotSelection: Locator;
  private readonly publishButton: Locator;
  private readonly syncStartedConfirmation: Locator;


  constructor(page: Page) {
    this.page = page;
    this.syncButtonToOpenModal = this.page.getByTitle('Publish Data to Consumption').locator('#resync_btn');
    this.publishSlotSelection = this.page.getByLabel('Publish ', { exact: false }).getByLabel('', { exact: true })
    this.publishButton = this.page.getByRole('button', { name: 'Publish' });
    this.syncStartedConfirmation = this.page.getByText('Sync UFM started');
  }

  async openPublishDSSModal() {
    await this.syncButtonToOpenModal.click();
  }

  async populatePublishDSSModal(options, slot) {
    for (let option of options) {
      await this.page.getByText(option).click();
    }
    await this.publishSlotSelection.selectOption(slot);
    await this.publishButton.click();
  }

  async waitForPublishDSS() {
    await this.syncStartedConfirmation.isVisible();
    await this.page.waitForTimeout(30000);
  }
}
