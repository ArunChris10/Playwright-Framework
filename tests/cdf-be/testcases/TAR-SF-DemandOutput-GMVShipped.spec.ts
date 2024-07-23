import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';


test.describe("Verify GMV = AUR * Units", { tag: "@Regression @verifyGMVShipped @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId = '';
  let scenarioForecast;
  let scenarioTotals;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify data is present for GMV shipped and is equal to AUR * Units", async ({
    request
  }) => {
    await test.step("GMV shipped = AUR * Units, getting the data", async () => {
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        scenarioForecast = demandScenarioResponse.forecast;
        scenarioTotals = demandScenarioResponse.forecastTotals;
    })

    await test.step("Verify forecast data", async () => {
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        scenarioForecast = demandScenarioResponse.forecast;
        scenarioTotals = demandScenarioResponse.forecastTotals;
        scenarioForecast.forEach(sbu => {
            sbu.forecast.forEach(forecastData => {
                CdfUtility.assertAmountWithinTolerance(forecastData.amount, forecastData.aur, forecastData.units);
            });
        });
    })
    await test.step("Verify Totals data", async () => {
        scenarioTotals.grandTotal.forecast.forEach(forecastData => {
            CdfUtility.assertAmountWithinTolerance(forecastData.amount, forecastData.aur, forecastData.units);
        });
        scenarioTotals.totalAfterExcludingDepartments.forecast.forEach(forecastData => {
            CdfUtility.assertAmountWithinTolerance(forecastData.amount, forecastData.aur, forecastData.units);
        });
        scenarioTotals.totalOfExcludingDepartments[0].forecast.forEach(forecastData => {
            CdfUtility.assertAmountWithinTolerance(forecastData.amount, forecastData.aur, forecastData.units);
        });
    })
  });

})
