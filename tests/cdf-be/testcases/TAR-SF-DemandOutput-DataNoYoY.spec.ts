import debug from "debug";
import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import getDemandTestData from '../testdata/get-demand-scenario-forecast.json';
import { compileFunction } from "vm";


test.describe("Verify FY20 for non YOY metrics", { tag: "@Regression @DataNoYoY @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId = '';
  let scenarioForecast: { forecast: { year: number; }[]; }[];

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify FY20 for non YOY metrics is populated", async ({
    request
  }) => {
    await test.step("Verify FY20 for non YOY metrics is populated", async () => {
        let demandScenarioResponse = await CdfUtility.getDemandScenarioById(request, demandId);
        scenarioForecast = demandScenarioResponse.forecast;
    })

    await test.step("Verify forecast data", async () => {
        const containsYear2020 = scenarioForecast.some((item: { forecast: { year: number; }[]; }) => {
            if (item.forecast) {
              return item.forecast.some((innerItem: { year: number; }) => innerItem.year === 2020);
            }
            return false;
          });
        CdfUtility.assertFY2020WithinTolerance(containsYear2020);

    })
  });

})
