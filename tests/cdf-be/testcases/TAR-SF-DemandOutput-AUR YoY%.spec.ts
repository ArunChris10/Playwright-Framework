import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';

test.describe("Verify if user can see the data for AUR y/y growth % (xxx.xx 2 decimals)", { tag: "@Regression @verifyAURYoY @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId;
  let scenarioForecast;
  let scenarioTotals;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify if user can see the data for AUR yoy growth %", async ({
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
                const expectedAurPercentage = (currentYearData.aur - pastYearData.aur) / (pastYearData.aur / 100);
                expect(parseFloat(Math.abs(expectedAurPercentage - currentYearData.forecastGrowth['yearOverYearAurPercentage']).toFixed(2))).toBeLessThanOrEqual(0.01);
            }
        }
    })
    await test.step("Verify Totals data", async () => {
        for (let i = 1; i < scenarioTotals.grandTotal.forecast.length; i++) {
            let pastYearData = scenarioTotals.grandTotal.forecast[i - 1];
            let currentYearData = scenarioTotals.grandTotal.forecast[i];
            const expectedAurPercentage = (currentYearData.aur - pastYearData.aur) / (pastYearData.aur / 100);
            expect(parseFloat(Math.abs(expectedAurPercentage - currentYearData.forecastGrowth['yearOverYearAurPercentage']).toFixed(2))).toBeLessThanOrEqual(0.01);
        }
        for (let i = 1; i < scenarioTotals.totalAfterExcludingDepartments.forecast.length; i++) {
            let pastYearData = scenarioTotals.totalAfterExcludingDepartments.forecast[i - 1];
            let currentYearData = scenarioTotals.totalAfterExcludingDepartments.forecast[i];
            const expectedAurPercentage = (currentYearData.aur - pastYearData.aur) / (pastYearData.aur / 100);
            expect(parseFloat(Math.abs(expectedAurPercentage - currentYearData.forecastGrowth['yearOverYearAurPercentage']).toFixed(2))).toBeLessThanOrEqual(0.01);
        }
        for (let i = 1; i < scenarioTotals.totalOfExcludingDepartments[0].forecast.length; i++) {
            let pastYearData = scenarioTotals.totalOfExcludingDepartments[0].forecast[i - 1];
            let currentYearData = scenarioTotals.totalOfExcludingDepartments[0].forecast[i];
            const expectedAurPercentage = (currentYearData.aur - pastYearData.aur) / (pastYearData.aur / 100);
            expect(parseFloat(Math.abs(expectedAurPercentage - currentYearData.forecastGrowth['yearOverYearAurPercentage']).toFixed(2))).toBeLessThanOrEqual(0.01);
        }
    })
  });
})