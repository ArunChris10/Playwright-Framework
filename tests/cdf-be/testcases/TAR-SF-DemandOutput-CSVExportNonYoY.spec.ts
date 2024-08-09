import debug from "debug";
import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';
import { compileFunction } from "vm";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";


test.describe("Verify data downloaded for FY20 for non YOY metrics", { tag: "@Regression @DataNoYoYCSV @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId = '';
  let csvResponse;
  let scenarioForecast: { forecast: { year: number; }[]; }[];

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify data downloaded for FY20 for non YOY metrics", async ({
    request
  }) => {
    await test.step("Verify data downloaded for FY20 for non YOY metrics", async () => {
        let csvResponse = await CdfUtility.getDemandScenarioByIdNonYOYCSV(request, demandId);
        let csvResponseData = await DemandBaseClass.getCellValueFromExcel(csvResponse,"B2")
        debug.log(csvResponseData);
        expect(csvResponseData).toEqual(2020);

    })
  });

})