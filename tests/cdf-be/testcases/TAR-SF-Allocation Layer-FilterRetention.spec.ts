import debug from "debug";
import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';
import { compileFunction } from "vm";


test.describe("Verify Allocation Layer filter Retention", { tag: "@Regression @FilterRetenrionAllocation @ibg-service-scenario-financials @DemandOutput @AllocationLayer" }, () => {

  let demandId = '';
  let scenarioForecast: { forecast: { year: number; }[]; }[];
  let scenarioForecast1: { forecast: { year: number; }[]; }[];

  let sbu = []
  let sbuIds = []
  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify Allocation Layer filter Retention", async ({
    request
  }) => {
    await test.step("Verify Allocation Layer filter Retention", async () => {
        let demandScenarioResponse = await CdfUtility.getDemandScenarioByIdBeforeFilterSave(request, demandId);
        scenarioForecast = demandScenarioResponse.forecast;
    })
    await test.step("Verify Allocation Layer filter Retention", async () => {
        let filtersave = await CdfUtility.saveUserProfileFilter(request, demandId);

    })
    await test.step("Verify Allocation Layer filter Retention", async () => {
        let filters = await CdfUtility.fetchUserProfileFilter(request, demandId);
        const filterJson = JSON.parse(filters.filterJson);
         sbu = filterJson.sbu;
         sbuIds = filterJson.sbuIds;


    })
    await test.step("Verify Allocation Layer filter Retention", async () => {
        let demandScenarioResponse = await CdfUtility.getDemandScenarioByIdWithFilters(request, demandId,sbu,sbuIds);
        scenarioForecast1 = demandScenarioResponse.forecast;
        // debug.log("scenarioForecast", JSON.stringify(scenarioForecast));
        // debug.log("scenarioForecast1", JSON.stringify(scenarioForecast1));
        expect(scenarioForecast1).toEqual(scenarioForecast);

    })


  });

})
