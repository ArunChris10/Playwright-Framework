import { expect, Page, Locator } from '@playwright/test';
import { matchers } from 'playwright-expect';
import { TIMEOUT_SSDM_FE, TIMEOUT_FE_WAIT } from '../constants/timeout.json';
import { Utility } from "../../common/fixtures/utils";
import { testData, roles } from '../testdata/fileName.json';

// Extend Playwright's expect with custom matchers
expect.extend(matchers);

/**
 * Utility class to handle sign-in operations for the application.
 */
export class signinUtility {

    // Static properties to hold references to page elements and configurations
    static page: Page;
    static password: Locator;
    static userId: Locator;
    static country: Locator;
    static location: Locator;
    static signIn: Locator;

    // URL endpoint and username are fetched from environment variables
    static readonly urlEndpoint = process.env.uiAppBaseURL + "";
    static readonly userName = process.env.ufmUser;

    /**
     * Initializes locators for the sign-in page.
     * @param page Playwright Page object
     */
    static async initialize(page: Page) {
        this.page = page;
        this.userId = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
        this.password = page.getByPlaceholder("Password");
        this.country = page.locator("#domainName");
        this.location = page.locator("#BU");
        this.signIn = page.getByText("SIGN IN");
    }

    /**
     * Performs the sign-in operation.
     * Navigates to the sign-in page, fills credentials, and clicks sign in.
     * Retries once if the page does not load.
     * @param signinPage Playwright Page object
     */
    static async SignIn(signinPage: Page, role?: string) {
        let loaded = false;
        for (let attempt = 0; attempt < testData.signInRetryNumber; attempt++) {
            try {
                await signinPage.goto(this.urlEndpoint, { timeout: TIMEOUT_SSDM_FE, waitUntil: 'domcontentloaded' });
                await signinPage.getByPlaceholder("User ID (e.g. wm5p4rk)").waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
                loaded = true;
                break;
            } catch (e) {
                if (attempt === 0) {
                    await signinPage.reload();
                } else {
                    throw e;
                }
            }
        }
        if (!loaded) throw new Error('Sign-in page did not load.');

        await this.initialize(signinPage);

        await this.userId.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
        await this.password.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });

        let userName: string;
        let password: string;
        if (role && roles && roles[role]) {
            userName = roles[role].userName;
            password = roles[role].password 
        } else {
            userName = String(this.userName);
            password = await Utility.getLoginPassword(userName);
        }
        await this.userId.fill(userName);
        await this.password.fill(password);
        await this.signIn.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT });
        await this.signIn.click();
        const landingSearchBox = signinPage.locator('input[type="search"]');
        await landingSearchBox.waitFor({ state: 'visible', timeout: TIMEOUT_FE_WAIT * 2 });
    }
}


