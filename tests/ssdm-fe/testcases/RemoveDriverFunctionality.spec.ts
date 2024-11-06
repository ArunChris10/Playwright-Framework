import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Remove Driver Feature Test', { tag: "@Smoke @Regression @removeFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify User is able to remove selected Driver', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);

        await test.step('User can see selected driver on my kpi table', async () => {    
            await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);
            await objpageFactory.ssdmPageFactory().drivers().selectAndViewDriver(testData.inputDriverFirst, testData.inputDriverSecond);

        });

        await test.step('User clicks on view drivers option', async () => {           
            await objpageFactory.ssdmPageFactory().removeDrivers().clickOnViewDrivers();

        });

        await test.step('User can remove selected driver', async () => {           
            await objpageFactory.ssdmPageFactory().removeDrivers().clickOnCrossButton();
            await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers();

        });

        await test.step('User should not be able to see removed driver in my kpi table', async () => {           
            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().validateDriverPresence(testData.inputDriverFirst)).toBeTruthy()
            await objpageFactory.ssdmPageFactory().removeDrivers().isDriverNotVisible();

        });
    })
})