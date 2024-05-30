import { testData } from '../testdata/filter.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";


testData.forEach(filter => {
    test.describe(
        'View table data in billions',
        { tag: "@Smoke @dataBillions" },
        async () => {
            let payload = filter
            let objpageFactory: PageFactory;

            test.beforeAll(async ({ pageFactory }) => {
                objpageFactory = pageFactory;
            })

            test(
                `Verify user can view data of the table in billions`,
                { tag: "@dataBillions" },
                async () => {

                    test.setTimeout(300000);

                    interface forecastValues {
                        totalValue: number,
                        netSales: number
                    }

                    let forecastValueAbsolute: forecastValues
                    let forecastValueBillions: forecastValues

                    await test.step('Go To UFM Page', async () => {
                        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
                    })
                    await test.step(`Click on ${payload.sbaName} Organization`, async () => {
                        await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(payload.sbaName);
                    })
                    await test.step('Click on View in Absolute Numbers selection', async () => {
                        await objpageFactory.ufmPageFactory().currentForecast().waitForForecastToLoad()
                        await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn("Absolute")
                        forecastValueAbsolute = await objpageFactory.ufmPageFactory().currentForecast().getForecastValues()
                    })


                    await test.step('Click on View in Billions Numbers selection', async () => {
                        await objpageFactory.ufmPageFactory().currentForecast().clickOnViewIn("Billions")
                    })

                    await test.step('Validate Value in Billion matches Absolute value post conversion', async () => {
                        forecastValueBillions = await objpageFactory.ufmPageFactory().currentForecast().getForecastValues()
                        var formattedNumber = parseFloat((forecastValueAbsolute.totalValue / 1000000000).toFixed(2))
                        expect(Math.round(formattedNumber * 10) / 10).toEqual(forecastValueBillions.totalValue)
                    })

                })



        })
})
