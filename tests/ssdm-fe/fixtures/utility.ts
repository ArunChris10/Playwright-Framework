import { test, expect, Page, Browser, Locator } from '@playwright/test';
import { LoginPage } from "../../common/pages/login.page";
import { TIMEOUT } from '../constants/timeout.json';
import { Home } from '../../common/pages/home.page';
import { matchers } from 'playwright-expect';

expect.extend(matchers);

  // export async function signinUtility(page?) {
    //              this.page = page;
    //             // const { uiAppBaseURL } = process.env;
    //             // await page.waitForURL(process.env.uiAppBaseURL + "", { timeout: 300000 })
    //             await page.goto(process.env.uiAppBaseURL + "", { timeout: 300000 })
    //             const loginPage = new LoginPage(page);

    //             await page.locator('[placeholder ="User ID (e.g. wm5p4rk)"]').fill('LB-ibg-ufm-auto');
    //             //await loginPage.login(ufmUser);
    //             await page.locator('[placeholder="Password"]').fill('f@k4p@8H');
    //             //   await Utility.getLoginPassword(userId)    
    //             await page.locator('[id="domainName"]').selectOption('Lab');
    //             await page.locator('[id="BU"]').selectOption('Homeoffice');
    //             //await page.pause()
    //             await page.locator('[title="Sign In"]').click();
    // }

    export class signinUtility {

    static page: Page;
    static password: Locator;
    static userId: Locator;
    static country: Locator;
    static location: Locator;
    static signIn: Locator;
    //static authFile = 'secrets/user-storagestate.json';
    static readonly urlEndpoint = process.env.uiAppBaseURL + "";
    
  
    static async initialize(page: Page) {
      this.page = page;
      this.userId = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
      this.password = page.getByPlaceholder("Password");
      this.country = page.locator("#domainName");
      this.location = page.locator("#BU");
      this.signIn = page.getByText("SIGN IN");
    }
  
    static async SignIn(page1 : Page) {
      await page1.goto(this.urlEndpoint, { timeout: 300000 });
      this.initialize(page1);
      await this.userId.fill('LB-ibg-ufm-auto');
      await this.password.fill('f@k4p@8H');
      // await this.country.fill('Lab')
      // await this.location.fill('Homeoffice')
      await this.signIn.click();
    }
  
    }


