import { Locator, Page } from "@playwright/test";
import debug from "debug";
import { Utility } from "../../common/fixtures/utils";

export class LoginPage {
  readonly page: Page;
  readonly txtPassword: Locator;
  readonly txtUserName: Locator;
  readonly drpCountry: Locator;
  readonly drpLocation: Locator;
  readonly btnSignIn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.txtPassword = page.getByPlaceholder("Password");
    this.txtUserName = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
    this.drpCountry = page.locator("#domainName");
    this.drpLocation = page.locator("#BU");
    this.btnSignIn = page.getByText("SIGN IN");
  }

  async login(url, userName) {
    debug.log("Logging into " + url);
    await this.page.goto("about:blank");
    await this.page.goto(url);
    await this.txtUserName.fill(userName);
    await this.txtPassword.fill(await Utility.getLoginPassword(userName));
    await this.btnSignIn.click();
    await this.page.waitForURL(url);
  }
}
