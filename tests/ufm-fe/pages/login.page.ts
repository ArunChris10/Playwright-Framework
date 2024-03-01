import { Locator, Page } from "@playwright/test";
import debug from "debug";
import fs from "fs";


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

  async login(userName) {
    const url = process.env.ufmAppBaseURL + "";
    
    debug.log("Logging into " + url);
    await this.page.goto("about:blank");
    await this.page.goto(url, { timeout: 120000 });
    await this.txtUserName.fill(userName);
    await this.txtPassword.fill(await this.getPassword(userName));
    await this.btnSignIn.click();
  }

  private async getPassword(userId){
    let raw_ufm_secrets
    if(!process.env.CI){
      raw_ufm_secrets = fs.readFileSync('./secrets/ufm-secrets.json', 'utf8');
    }else{
      raw_ufm_secrets = fs.readFileSync(process.env.ufm_secrets+"", 'utf8');
    }
    const ufm_secrets = JSON.parse(raw_ufm_secrets);
    return ufm_secrets[userId]
    
  }


}
