import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import getCurrentDemandForecast from '../testdata/get-currentdemand-scenario-forecast.json'

test.describe("Verify actuals data exist and forecasted data for 6 years", { tag: "@Regression @ibg-service-scenario-financials @DemandOutput @verifyActualsForecastedExist" }, () => {
    let demandId;
    let cutOffYear;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify actuals start at 2020 and forecasted has 6 years", async ({ request }) => {
        let getDemandScenarioForecastResponse;
        await test.step("Fetch the get-demand-scenario-forecast initially", async () => {
            getDemandScenarioForecastResponse = await CdfUtility.getCurrentDemandForecast(request, getCurrentDemandForecast.payload_all_years_only);
        });



        await test.step("Verify actuals start at 2020 and forecasted has 6 years", async () => {
            cutOffYear = parseInt(getDemandScenarioForecastResponse.cutOffDate.split('-')[0]);
            let yearsPresent = [];
            for (let forecast of getDemandScenarioForecastResponse.yearlyForecast[0].forecast) {
                yearsPresent.push(forecast.year);
            }
            expect(yearsPresent[0]).toBe(2020);
            expect(yearsPresent[yearsPresent.length-6]).toBe(cutOffYear);
            for (let i = 1; i < yearsPresent.length; i++) {
                expect(yearsPresent[i]).toBe(yearsPresent[i-1] + 1);
            }
        });
    });
});