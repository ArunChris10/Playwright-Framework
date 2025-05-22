import { expect, Page, Locator } from '@playwright/test';
import { TIMEOUT } from '../constants/timeout.json';
import { matchers } from 'playwright-expect';
import { Utility } from "../../common/fixtures/utils";

// Extend Playwright's expect with custom matchers
expect.extend(matchers);

// Class to handle sign-in utility functions
export class signinUtility {

    // Static properties to hold references to page elements and configurations
    static page: Page;
    static password: Locator;
    static userId: Locator;
    static country: Locator;
    static location: Locator;
    static signIn: Locator;
    // URL endpoint and username are fetched from environment variables
    static readonly urlEndpoint = process.env.ufmAppBaseURL + "";
    static readonly userName = process.env.ufmUser;

    // Method to initialize locators for the sign-in page
    static async initialize(page: Page) {
        this.page = page;
        // Locate input fields and buttons using placeholders and selectors
        this.userId = page.getByPlaceholder("User ID (e.g. wm5p4rk)");
        this.password = page.getByPlaceholder("Password");
        this.country = page.locator("#domainName");
        this.location = page.locator("#BU");
        this.signIn = page.getByText("SIGN IN");
    }

    // Method to perform the sign-in operation
    static async SignIn(signinPage: Page) {
        // Navigate to the application URL with a timeout
        await signinPage.goto(this.urlEndpoint, { timeout: 3000000 });
        // Initialize locators for the page
        this.initialize(signinPage);
        // Fill in the user ID and password fields
        await this.userId.fill(String(this.userName));
        await this.password.fill('}+Og0\\O8');
        // Click the sign-in button to log in
        await this.signIn.click();
    }
}