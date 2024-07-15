import { test } from "../../common/fixtures/test-hook";
import debug from "debug";
import getCurrentDemandForecast from '../testdata/get-demand-scenario-forecast.json';
import filtersData from '../testdata/filterretention.json';
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify scenario is archived", { tag: "@Smoke @getDemandScenario" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let demandScenario;
  let payload;

  test("Verify if the data is shown as per selected filters @getdemandscenario", async ({
    request
  }) => {
    demandScenario = await CdfUtility.getDemandScenario(request, getCurrentDemandForecast.payload);
    debug.log("Demand Scenario  : ", demandScenario);
  });

})

test.describe("Verify filters are being retained in demand scenario", { tag: "@Smoke @filterRetention" }, () => {

    let demandId;
    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request);});
    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId);});


    test("Make sure filters are saved", async ({ request }) => {
        await test.step("Save filters", async () => {
            let saveFilterDataResponse;
            saveFilterDataResponse = await CdfUtility.saveFiltersSaved(request, demandId, filtersData);
        });

        await test.step("Get filters", async () => {
            let getFilterDataResponse;
            getFilterDataResponse = await CdfUtility.checkFiltersSaved(request, demandId, filtersData);
        });
    })
})