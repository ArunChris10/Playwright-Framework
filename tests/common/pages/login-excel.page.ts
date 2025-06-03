import { expect, FrameLocator, Locator, Page } from "@playwright/test";
import { LoginPage } from "./login.page";
import { Utility } from "../fixtures/utils";

export class LoginExcelPage {
  readonly page: Page;
  readonly email: Locator;
  readonly noBtn: Locator;
  readonly parentIframe: FrameLocator;
  readonly mainIframe: FrameLocator;
  readonly homeTab: Locator;
  readonly ssoWindow: Locator;
  readonly userInput: Locator;
  readonly passwordInput: Locator;
  readonly signInBtn: Locator;
  readonly failedSSOMessage: Locator;
  readonly closeSSOBtn: Locator;
  readonly welcomeTxt: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByPlaceholder("userid@yourdomain.wal-mart.com");
    this.noBtn = page.getByRole("button", { name: "No" });
    this.parentIframe = page.frameLocator("#WacFrame_Excel_0");
    this.mainIframe = this.parentIframe
      .frameLocator('iframe[title*="Office Add-in IBG Excel Addin"]')
      .first();
    this.homeTab = this.parentIframe.locator("#Home");
    this.ssoWindow = this.parentIframe.locator("#WACDialogPanel");
    this.userInput = this.mainIframe.getByPlaceholder("User ID (e.g. wm5p4rk)");
    this.passwordInput = this.mainIframe.getByPlaceholder("Password");
    this.signInBtn = this.mainIframe.getByText("SIGN IN");
    this.failedSSOMessage = this.mainIframe.getByText(
      "We didn't recognize the username or password you entered. Please try again."
    );
    this.closeSSOBtn = this.parentIframe
      .locator("#WACDialogTitlePanel")
      .getByRole("button");
    this.welcomeTxt = this.mainIframe.getByText(
      "Welcome to IBG's Excel Add-in"
    );
  }

  private async openTestWorkbook(excelTestWorkbookURL, user) {
    await this.page.goto(excelTestWorkbookURL);
    await this.email.click();
    await this.email.fill(user + "@homeoffice.wal-mart.com");
    await this.page.keyboard.press("Enter");
    const loginPage = new LoginPage(this.page);
    await loginPage.login(user);
    await this.noBtn.click();
    await this.page.waitForLoadState("load");
  }

  private async openAddinSSO(envName) {
    const ibgAddinBtn = this.parentIframe.locator(`text=IBG(${envName})`);
    // TODO: reduce flakiness
    for (let attempt = 0; attempt < 2; attempt++) {
      await this.homeTab.click();
      await this.page.waitForTimeout(5000);
      expect(ibgAddinBtn).toBeVisible();
      await ibgAddinBtn.click();
      if (await this.ssoWindow.isVisible()) {
        break;
      }
    }
  }

  /**
   * Prerequisite for local until we have production test account:
   * - user has AD group and sees IBG Excel Addin in online excel
   * - user has link to a test workbook (add to .env-cmdrc.json for "excelUser" and "excelTestWorkbookURL")
   * - user lab and production credentials added to ufm-secrets.json in format "user-lab" and "user"
   */
  async login() {
    const { excelTestWorkbookURL, envName, excelUser: user } = process.env;
    if (!excelTestWorkbookURL || !envName || !user) {
      throw new Error("Missing environment variables.");
    }
    await this.openTestWorkbook(excelTestWorkbookURL, user);
    await this.openAddinSSO(envName);
    await this.userInput.fill(user);
    await this.passwordInput.fill(
      await Utility.getLoginPassword(
        envName === "dev" || envName === "qa" ? `${user}-lab` : user
      )
    );
    await this.signInBtn.click();
    await this.welcomeTxt.waitFor({ state: "visible" });
  }

  async verifySSOIsTriggered() {
    const { excelTestWorkbookURL, envName, excelUser: user } = process.env;
    if (!excelTestWorkbookURL || !envName || !user) {
      throw new Error("Missing environment variables.");
    }
    await this.openTestWorkbook(excelTestWorkbookURL, user);
    await this.openAddinSSO(envName);
    expect(this.ssoWindow).toBeVisible();
    expect(this.userInput).toBeVisible();
  }

  async verifySSOFailed() {
    await this.userInput.fill("bad_username");
    await this.passwordInput.fill("bad_password");
    await this.signInBtn.click();
    expect(this.failedSSOMessage).toBeVisible();
    await this.closeSSOBtn.click();
    expect(this.welcomeTxt).not.toBeVisible();
  }
}
