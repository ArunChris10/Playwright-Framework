import { Locator, Page } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import { Utility } from "../../common/fixtures/utils";
import { chromium } from "playwright";


export class LoginPage {
  readonly page: Page;
  readonly txtPassword: Locator;
  readonly txtUserName: Locator;
  readonly drpCountry: Locator;
  readonly drpLocation: Locator;
  readonly btnSignIn: Locator;
  readonly txtLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.txtPassword = page.getByPlaceholder("Password");
    this.txtUserName = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
    this.drpCountry = page.locator("#domainName");
    this.drpLocation = page.locator("#BU");
    debug.log("hi");
    this.btnSignIn = page.getByText("SIGN IN");
    debug.log("hello");
    this.txtLogo = page.getByText("Unified Financial Model");

  }

  async login(userName) {
    const url = process.env.ufmAppBaseURL + "";
    debug.log("Logging into " + url);
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.page.goto("about:blank");
    await this.page.goto(url, { timeout: 100000 });
    await this.txtUserName.fill(userName);
    await this.txtPassword.fill(await Utility.getLoginPassword(userName));
    debug.log("hel");
    await this.btnSignIn.click();
    debug.log("heo");
    await this.page.waitForSelector('.main-heading', { timeout: 120000, state: 'visible' });
    debug.log("helloooooooo");
    
}
}
    
  

  

  
  





