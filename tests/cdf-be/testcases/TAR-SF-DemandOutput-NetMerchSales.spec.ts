import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';

test.describe("Verify if user can see the data for Net Merch Sales", { tag: "@Regression @verifySales @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId;
  let scenarioForecast;
  let scenarioTotals;
  let manuallyCalculatedTotals = {};

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("verifySales", async ({
    request
  }) => {
    await test.step("getting the data", async () => {
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        scenarioForecast = demandScenarioResponse.forecast;
        scenarioTotals = demandScenarioResponse.forecastTotals;
    })

    await test.step("Verify forecast sales data", async () => {
        scenarioForecast.forEach(sbu => {
            sbu.forecast.forEach(forecastData => {
                expect(forecastData.sales).toBeDefined();
                const key = `${forecastData.year}-${forecastData.month}`;
                manuallyCalculatedTotals[key] = (manuallyCalculatedTotals[key] || 0) + forecastData.sales;
            });
        });
    })
    await test.step("Verify Totals data", async () => {
        scenarioTotals.grandTotal.forecast.forEach(forecastData => {
            const key = `${forecastData.year}-${forecastData.month}`;
            expect(parseFloat(manuallyCalculatedTotals[key].toFixed(2))).toBe(forecastData.sales);
        });
    })
  });

})