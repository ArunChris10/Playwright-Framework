import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

const authFile = 'playwright/.auth/user.json';

setup('authenticate ui', async ({ page }) => {
    setup.setTimeout(240000);
    const loginPage = new LoginPage(page)
    await loginPage.login(process.env.ufmUser);
});