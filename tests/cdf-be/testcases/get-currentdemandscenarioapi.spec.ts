import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";
import getCurrentDemandForecast from '../testdata/get-currentdemand-scenario-forecast.json'

test.describe("Verify user is able to get current demand forecast on currentdemand page", { tag: "@Smoke @currentDemand" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let currentDemandScenario;

  test("verify that user should be able to see the data in Million , Billion and Absolute view", async ({
    request
  }) => {
    currentDemandScenario = await CdfUtility.getCurrentDemandForecast(request, getCurrentDemandForecast.payload);
    debug.log(" user is able : ",currentDemandScenario );
  });
})

test.describe("Verify user is able to view yOy data", { tag: "@Smoke @currentDemand @forecastYOY" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let currentDemandScenarioData;

  test("verify that user can get forecast data", async ({
    request
  }) => {
    await test.step("User can view y0y data and is verified", async () => {
        currentDemandScenarioData = await CdfUtility.getCurrentDemandForecast(request, getCurrentDemandForecast.payload_all_years_only);
        debug.log("User is able to view all the data received in year format" );
    })

    await test.step("User can view y0y data and is verified", async () => {
        for (const sbu of currentDemandScenarioData.yearlyForecast){
            expect(Object.keys(sbu.forecast[0])).not.toContain('forecastGrowth');
            for (let i = 1; i < sbu.forecast.length; i++) {
                expect(Object.keys(sbu.forecast[i])).toContain('forecastGrowth');
                let pastYearData = sbu.forecast[i - 1];
                let currentYearData = sbu.forecast[i];
                 
                const expectedYearOverYearSalesPercentage = (currentYearData.amount - pastYearData.amount) / (pastYearData.amount / 100);
                expect(parseFloat(expectedYearOverYearSalesPercentage.toFixed(2))).toBe(currentYearData.forecastGrowth['yearOverYearSalesPercentage']);

                const expectedUnitsPercentage = (currentYearData.units - pastYearData.units) / (pastYearData.units / 100);
                expect(parseFloat(expectedUnitsPercentage.toFixed(2))).toBe(currentYearData.forecastGrowth['yearOverYearUnitsPercentage']);

                const expectedAurPercentage = (currentYearData.aur - pastYearData.aur) / (pastYearData.aur / 100);
                expect(parseFloat(expectedAurPercentage.toFixed(2))).toBe(currentYearData.forecastGrowth['yearOverYearAurPercentage']);

                const expectedSalesPercentage = (currentYearData.sales - pastYearData.sales) / (pastYearData.sales / 100);
                expect(parseFloat(expectedSalesPercentage.toFixed(2))).toBe(currentYearData.forecastGrowth['yearOverYearConvertedSalesPercentage']);
                
                const expectedUomPercentage = (currentYearData.uomValue - pastYearData.uomValue) / (pastYearData.uomValue / 100);
                expect(parseFloat(expectedUomPercentage.toFixed(2))).toBe(currentYearData.forecastGrowth['yearOverYearUomPercentage']);
            }
        }
        debug.log("User is able to verify all data");
    })
    
  });
})