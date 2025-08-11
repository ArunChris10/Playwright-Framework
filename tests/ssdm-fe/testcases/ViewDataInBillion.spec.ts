import path from "path";
import { test, expect } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('View Table Data In Billions And Millions Feature Test', { tag: "@Smoke @BillionAndMillionsDataFunctionality @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui @ibg-platform2-ui" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify User is able to Select And Can View Data In Billions And Millions', async () => {

        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);
        let actualAndForecastDataInAbsolute: string | undefined;
        let actualAndForecastDataInBillion: string | undefined;
        let actualAndForecastDataInMillion: string | undefined;


        await test.step('User is able to see driver and driver data in my kpi table', async () => {
            await objpageFactory.ssdmPageFactory().drivers().navigateToMyKpiPage(expectedFilePath);
            await objpageFactory.ssdmPageFactory().drivers().selectAndViewDriver(testData.inputDriverFirst, testData.inputDriverSecond);

        });

        await test.step('Clicks on Absolute from the data view dropdown ', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn("Absolute");
            actualAndForecastDataInAbsolute = await objpageFactory.ssdmPageFactory().drivers().isActualsAndForecastDataVisible();
        });

        await test.step('Clicks on Billions from the data view dropdown ', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn("Billions");
            actualAndForecastDataInBillion = await objpageFactory.ssdmPageFactory().drivers().isActualsAndForecastDataVisible();
            expect(actualAndForecastDataInBillion?.includes('B')).toBe(true);
        });

        await test.step('Clicks on Millions from the data view dropdown ', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn("Millions");
            actualAndForecastDataInMillion = await objpageFactory.ssdmPageFactory().drivers().isActualsAndForecastDataVisible();
            expect(actualAndForecastDataInMillion?.includes('M')).toBe(true);

        });

        await test.step('Validate absolute and billion value matches post conversion', async () => {
            expect(parseFloat(actualAndForecastDataInAbsolute!) / 1e9).toEqual(parseFloat(actualAndForecastDataInBillion!));
        });

        await test.step('Validate absolute and million value matches post conversion', async () => {
            expect(parseFloat(actualAndForecastDataInAbsolute!) / 1e6).toEqual(parseFloat(actualAndForecastDataInMillion!));
        });


    })
})