import { expect, Locator, Page } from "@playwright/test";

export class signInPage {

  readonly page: Page;
  readonly password: Locator;
  readonly userId: Locator;
  readonly country: Locator;
  readonly location: Locator;
  readonly signIn: Locator;
  readonly authFile = 'secrets/user-storagestate.json';
  private readonly urlEndpoint = process.env.uiAppBaseURL + "";

  constructor(page: Page) {
    this.page = page;
    this.userId = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
    this.password = page.getByPlaceholder("Password");
    this.country = page.locator("#domainName");
    this.location = page.locator("#BU");
    this.signIn = page.getByText("SIGN IN");
  }

  async signin() {
    await this.page.goto(this.urlEndpoint, { timeout: 300000 });
    await this.userId.fill('LB-ibg-ufm-auto');
    await this.password.fill('f@k4p@8H');
    await this.country.fill('Lab')
    await this.location.fill('Homeoffice')
    await this.signIn.click();
  }

// async SignIn({ page }){
//     const signinPage = new signInPage(page);
// }
}