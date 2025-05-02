import { test, expect, Page, Browser, Locator } from '@playwright/test';
import { webkit, chromium, firefox } from 'playwright';
import { LoginPage } from "../../common/pages/login.page";
import { TIMEOUT } from '../constants/timeout.json';
import { Home } from '../../common/pages/home.page';
import { Utility } from "../../common/fixtures/utils";
import { matchers }from 'playwright-expect';

const ibgAuthFile = "secrets/ibg-user-storagestate.json"
const { uiAppBaseURL, ufmUser } = process.env;
expect.extend(matchers);
test.describe('Landing Page UI Validation', { tag: "@homepage" }, async () => {

    test('Login to SSDM using LabCredentials', async ({ page }) => {
        // const { uiAppBaseURL } = process.env;
        await page.goto(uiAppBaseURL + "", { timeout: 300000 })
        //   const homePage: Home = new Home(page);
        //    await homePage.open("Intelligent Business Growth")

        const loginPage = new LoginPage(page);

        await page.locator('[placeholder ="User ID (e.g. wm5p4rk)"]').fill('LB-ibg-ufm-auto');
        //await loginPage.login(ufmUser);
        await page.locator('[placeholder="Password"]').fill('f@k4p@8H');
        //   await Utility.getLoginPassword(userId)    
        await page.locator('[id="domainName"]').selectOption('Lab');
        await page.locator('[id="BU"]').selectOption('Homeoffice');
        await page.pause()
        await page.locator('[title="Sign In"]').click();
        // await loginPage.login(ufmUser);
        //  await page.waitForURL(uiAppBaseURL + "");
        //  await homePage.checkIfHomepageIsVisible();
        // await page.context().storageState({ path: ibgAuthFile });
    });

    test('Verify the search field is displayed', async ({ page }) => {
        const searchBox = page.locator('[placeholder="Search"]');
         test.setTimeout(TIMEOUT); 
        await expect(searchBox).toBeVisible();
        await expect(searchBox).toBeEnabled();
        await expect(searchBox).toHaveTitle('Search');
    });

    // test('Validate the input records count & calculation count is shown', async({page}) =>{
    // // const input = page.getByText('Inputs');
    // // await expect(input).toBeVisible();
    // // 
    // // const calculate = await page.locator('Calculations');
    // // await expect(button).toHaveAttribute('type', 'button');
    // // await expect(button).toHaveAttribute('class', 'primary-button');
    //     await expect(
    //         page.getByRole('button',{name: 'Inputs'})
    //             .or(page.getByRole('button'),{name: 'Calculations'}))
    //             .first()
    // ).toBeVisisble();
    // });

    // test('Check sort/group by is shown', async({page}) =>{
    // const button = await page.locator('button.primary-button');
    // await expect(button).toHaveAttribute('type', 'button');
    // await expect(button).toHaveAttribute('class', 'primary-button');
    // });

    // test('Table settings side bar is shown', async({page}) =>{

    // });

    // test('Filter options is shown for columns except metric name & type', async({page}) =>{

    // });
});
