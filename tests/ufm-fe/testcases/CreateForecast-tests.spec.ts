import { test, expect} from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { loggingIn } from '../testcases/homepage-tests.spec';
import { loginUsingCredentials } from '../testcases/homepage-tests.spec';


test('Login In @Filterss', async ({page }) => {
    const aa = new LoginPage(page)
    await aa.login(page);
    await loggingIn();

   
})

test('Loginn To UFM @Filterss', async ({page }) => {
    await loginUsingCredentials('LB-ibg-lob-opt');

})

test('Click on Create Forecast @FIlterss', async ({page })) => {
   
}

