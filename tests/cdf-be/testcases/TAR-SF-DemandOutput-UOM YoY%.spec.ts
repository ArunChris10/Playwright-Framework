import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';

test.describe("Verify if user can see the data for UOM y/y growth % (xxx.xx 2 decimals)", { tag: "@Regression @verifyUOMYoY @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId;
  let scenarioForecast;
  let scenarioTotals;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify if user can see the data for UOM yoy growth %", async ({
    request
  }) => {
    await test.step("getting all the data", async () => {
        let payload = getDemandTestData.payload;
        payload.timeFilter.filterLevel = "YEAR";
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        scenarioForecast = demandScenarioResponse.yearlyForecast;
        scenarioTotals = demandScenarioResponse.forecastTotals;
    })

    await test.step("Verify forecast data", async () => {
        for (const sbu of scenarioForecast) {
            for (let i = 1; i < sbu.forecast.length; i++) {
                let pastYearData = sbu.forecast[i - 1];
                let currentYearData = sbu.forecast[i];
                CdfUtility.verifyYoYPercentage(currentYearData.forecastGrowth['yearOverYearUomPercentage'], currentYearData.uomValue, pastYearData.uomValue);
            }
        }
    })
    await test.step("Verify Totals data", async () => {
        for (let i = 1; i < scenarioTotals.grandTotal.forecast.length; i++) {
            let pastYearData = scenarioTotals.grandTotal.forecast[i - 1];
            let currentYearData = scenarioTotals.grandTotal.forecast[i];
            CdfUtility.verifyYoYPercentage(currentYearData.forecastGrowth['yearOverYearUomPercentage'], currentYearData.uomValue, pastYearData.uomValue);
        }
        for (let i = 1; i < scenarioTotals.totalAfterExcludingDepartments.forecast.length; i++) {
            let pastYearData = scenarioTotals.totalAfterExcludingDepartments.forecast[i - 1];
            let currentYearData = scenarioTotals.totalAfterExcludingDepartments.forecast[i];
            CdfUtility.verifyYoYPercentage(currentYearData.forecastGrowth['yearOverYearUomPercentage'], currentYearData.uomValue, pastYearData.uomValue);
        }
        for (let i = 1; i < scenarioTotals.totalOfExcludingDepartments[0].forecast.length; i++) {
            let pastYearData = scenarioTotals.totalOfExcludingDepartments[0].forecast[i - 1];
            let currentYearData = scenarioTotals.totalOfExcludingDepartments[0].forecast[i];
            CdfUtility.verifyYoYPercentage(currentYearData.forecastGrowth['yearOverYearUomPercentage'], currentYearData.uomValue, pastYearData.uomValue);
        }
    })
  });
})