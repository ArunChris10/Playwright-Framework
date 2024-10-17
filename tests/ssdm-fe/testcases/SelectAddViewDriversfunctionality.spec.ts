import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Select,Add And View Driver Feature Test', { tag: "@driverFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify User is able to Select,Add And View Driver', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);

        await test.step('User navigates to My KPI page once clicks on review button', async () => {
            
            await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);

        });

        await test.step('User clicks on Add Drivers button', async () => {
            await objpageFactory.ssdmPageFactory().drivers().clickOnAddDriverButton();

        });

        await test.step('Validate user is able to see Add Drivers Window', async () => {
            await objpageFactory.ssdmPageFactory().drivers().isAddDriverWindowVisible();

        });

        await test.step(`Search for input driver ${testData.inputDriverName}`, async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad();
            await objpageFactory.ufmPageFactory().addDriverPage().inputDriverName(testData.inputDriverName);
    
        });

        await test.step(`Select input driver ${testData.inputDriverName}`, async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().selectDriver(testData.inputDriverName);
            
        });

        await test.step('Click On apply driver', async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers();
            
        });

        await test.step('Validate added driver is visible on KPI table', async () => {
            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().validateDriverPresence(testData.inputDriverName)).toBeTruthy()
            
        });

        await test.step('Validate Actual and Forecast data is visible for the particular driver on KPI table', async () => {
            await objpageFactory.ssdmPageFactory().drivers().isActualsAndForecastDataVisible();
        });
        
       
    })
})