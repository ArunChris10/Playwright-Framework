import { Locator, Page } from "@playwright/test";

export class UploadFunctionality {

  readonly page: Page;
  readonly adminsTab: Locator;
  readonly ssdmTab: Locator;
  readonly btnUpload: Locator;
  readonly fileName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminsTab = page.getByText("Admins");
    this.ssdmTab = page.getByText("Self service driver management");
    this.btnUpload = page.locator('//label[@class = "upload-container"]');
    this.fileName = page.locator("//span[contains(@class, 'selected-file')]");

  }

  async clickOnAdminTab() {
    await this.adminsTab.waitFor({ state: "visible" })
    await this.adminsTab.click();

  }

  async clickOnSSDM() {
    await this.ssdmTab.waitFor({ state: "visible" })
    await this.ssdmTab.click();
    await this.page.reload();
  }

  async visibilityOfUploadButton() {
    await this.btnUpload, { state: "visible" };

  }

  async selectFileToBeUploaded(filepath: string) {
    await this.btnUpload.setInputFiles(`${filepath}`);
    await this.page.waitForTimeout(5000);

  }

  async fileFormatIsInCsv() {
    const fileName = await this.btnUpload.inputValue();
    const fileExtension = fileName.split('.').pop();
    console.log(fileExtension);
    return fileExtension

  }

  async verifyUploadedFileName() {
    const actualFileName = await this.fileName.innerText();
    return actualFileName;

  }
}