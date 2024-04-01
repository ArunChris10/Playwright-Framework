import { test as setup, expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { LoginPage } from "../pages/login.page";
import { Home } from "../pages/home.page";
const nexusAuthFile = 'secrets/nexus-user-storagestate.json';
const ibgAuthFile = "secrets/ibg-user-storagestate.json"


// This Login method is used for Login to IBG app
// This method logs in by adding the Fake Token into the browser Local storage
  setup("Login to @CDF using @faketoken api", async ({ page, request }) => {
    
    await Utility.loginToIBGUsingToken(page,request);
    const homePage: Home = new Home(page);
    await homePage.checkIfHomepageIsVisible();
    await homePage.open("Demand Workspace")
    await page.context().storageState({ path: ibgAuthFile });
  });

  // This Login method is used for Login to UFM from workbench URL in IBG APP
  // This method logs in by typing in the test account credentials in Login Page
  setup("Login to @UFM using @LabCredentials", async ({ page,request }) => {
    
    await Utility.loginToIBGUsingToken(page,request);
    const homePage: Home = new Home(page);
    await homePage.checkIfHomepageIsVisible();
    await homePage.open("Unified Financial Model")
    const { ufmAppBaseURL, ufmUser } = process.env;
    const loginPage = new LoginPage(page);
    await loginPage.login(ufmUser);
    await page.waitForURL(ufmAppBaseURL+"");
    await homePage.checkIfHomepageIsVisible();
    await page.context().storageState({ path: nexusAuthFile });
  });

