import { test as setup, expect } from '../../common/fixtures/test-hook'
import { Utility } from '../../common/fixtures/utils';
import { LoginPage } from '../pages/login.page';
import { Home } from "../pages/home.page";
const nexusAuthFile = 'secrets/nexus-user-storagestate.json';
const ibgAuthFile = "secrets/ibg-user-storagestate.json"

// This Login method is used for Login to IBG app
// This method logs in by adding the Fake Token into the browser Local storage
setup('Login to @CDF using @faketoken api', async ({page,request }) => {
 
    const {appBaseURL} = process.env;   
    setup.setTimeout(240000);
    await page.goto(appBaseURL+"/page-with-no-auth");    
    await page.evaluate(() => localStorage.setItem('isAutomationTestRunning',JSON.stringify(true)));
    const token = await Utility.getIBGFakeToken(process.env.cdfUser+"",request);
    await page.evaluate(token => localStorage.setItem('token',JSON.parse(token)),token);
    const url = appBaseURL + "/centrifuge";
    await page.goto(url)
    const homePage : Home = new Home(page);
    await homePage.checkIfHomepageIsVisible();  
    await page.context().storageState({ path: ibgAuthFile })
  
  });

  // This Login method is used for Login to UFM Individual URL in IBG APP
  // This method logs in by typing in the test account credentials in Login Page
  setup('Login to @UFM using @LabCredentials', async ({ page }) => {
    setup.setTimeout(240000);
    const {ufmAppBaseURL,ufmUser} = process.env; 
    const loginPage = new LoginPage(page)

    await loginPage.login(ufmAppBaseURL,ufmUser);
    // const homePage : Home = new Home(page);
    // await homePage.checkIfHomepageIsVisible();  
    await page.context().storageState({ path: nexusAuthFile })
});