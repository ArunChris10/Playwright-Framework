import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';


test.describe("Verify demand scenario is showing correct filters", { tag: "@Regression @verifyFilters @@ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify demand scenario is showing correct SBUs that were requested", async ({
    request
  }) => {
    let sbus: { sbuName: string; sbuId: number; }[] = [];

    await test.step("Getting all SBUs Possible", async () => {
        let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, getDemandTestData.payload);
        let scenarioForecast = demandScenarioResponse.forecast;
        scenarioForecast.forEach(sbu => {
            sbus.push({sbuName: sbu.sbu, sbuId: sbu.sbuId});
        });
    })

    await test.step("Testing each individual SBU", async () => {
        for (const sbu of sbus) {
            let payload = getDemandTestData.payload;
            payload.sbu = [sbu.sbuName];
            payload.sbuIds = [sbu.sbuId];
            let demandScenarioResponse = await CdfUtility.getCurrentDemandForecast(request, payload);
            let scenarioForecast = demandScenarioResponse.forecast;
            let scenarioTotalForecast = demandScenarioResponse.forecastTotals;
            expect(scenarioForecast.length).toBe(1);
            expect(scenarioForecast[0].sbu).toBe(sbu.sbuName);
            expect(scenarioForecast[0].sbuId).toBe(sbu.sbuId);
            expect(scenarioForecast[0].forecast).toStrictEqual(scenarioTotalForecast.grandTotal.forecast);
        }
    })
  });
});
