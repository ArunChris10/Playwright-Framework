import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';


test.describe("Verify UOM is there and exists, and totals is correct", { tag: "@Regression @verifyUOM @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId = '';
  let scenarioForecast;
  let scenarioTotals;
  let manuallyCalculatedTotals = {};

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify data is present for UOM", async ({
    request
  }) => {
    await test.step("getting the data", async () => {
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        scenarioForecast = demandScenarioResponse.forecast;
        scenarioTotals = demandScenarioResponse.forecastTotals;
    })

    await test.step("Verify forecast uom data", async () => {
        scenarioForecast.forEach(sbu => {
            sbu.forecast.forEach(forecastData => {
                expect(forecastData.sales).toBeDefined();
                const key = `${forecastData.year}-${forecastData.month}`;
                manuallyCalculatedTotals[key] = (manuallyCalculatedTotals[key] || 0) + forecastData.uomValue;
            });
        });
    })
    await test.step("Verify Totals data", async () => {
        scenarioTotals.grandTotal.forecast.forEach(forecastData => {
            const key = `${forecastData.year}-${forecastData.month}`;
            expect(parseFloat(manuallyCalculatedTotals[key].toFixed(2))).toBe(forecastData.uomValue);
        });
    })
  });

})