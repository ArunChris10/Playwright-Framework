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
  readonly authFile = 'secrets/user-storagestate.json';

  constructor(page: Page) {
    this.page = page;
    this.txtPassword = page.getByPlaceholder("Password");
    this.txtUserName = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
    this.drpCountry = page.locator("#domainName");
    this.drpLocation = page.locator("#BU");
    this.btnSignIn = page.getByText("SIGN IN");


  }

  async login(userName) {
    await this.txtUserName.fill(userName);
    await this.txtPassword.fill(await Utility.getLoginPassword(userName));
    await this.btnSignIn.click();
  }
}