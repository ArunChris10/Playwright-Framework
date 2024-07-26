import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';


test.describe("Verify Scanned Units is equal to GMV Shipped divided by AUR", { tag: "@Regression @verifyScannedUnits @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId = '';
  let scenarioForecast;
  let scenarioTotals;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify data is present for Scanned Units and is equal to GMV Shipped divided by AUR", async ({
    request
  }) => {
    await test.step("Scanned Units = GMV Shipped divided by AUR, getting the data", async () => {
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        scenarioForecast = demandScenarioResponse.forecast;
        scenarioTotals = demandScenarioResponse.forecastTotals;
    })

    await test.step("Verify forecast data", async () => {
        scenarioForecast.forEach(sbu => {
            sbu.forecast.forEach(forecastData => {
                CdfUtility.assertUnitsWithinTolerance(forecastData.units, forecastData.amount, forecastData.aur);
            });
        });
    })
    await test.step("Verify Totals data", async () => {
        scenarioTotals.grandTotal.forecast.forEach(forecastData => {
            CdfUtility.assertUnitsWithinTolerance(forecastData.units, forecastData.amount, forecastData.aur);
        });
        scenarioTotals.totalAfterExcludingDepartments.forecast.forEach(forecastData => {
            CdfUtility.assertUnitsWithinTolerance(forecastData.units, forecastData.amount, forecastData.aur);
        });
        scenarioTotals.totalOfExcludingDepartments[0].forecast.forEach(forecastData => {
            CdfUtility.assertUnitsWithinTolerance(forecastData.units, forecastData.amount, forecastData.aur);
        });
    })
  });

})
