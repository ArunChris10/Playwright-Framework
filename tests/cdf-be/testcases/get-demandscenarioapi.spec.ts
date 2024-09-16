import { test } from "../../common/fixtures/test-hook";
import debug from "debug";
import getCurrentDemandForecast from '../testdata/get-demand-scenario-forecast.json';
import filtersData from '../testdata/filterretention.json';
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify scenario is archived", { tag: "@Smoke @getDemandScenario @ibg-service-scenario-financials @Regression" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let demandScenario;
  let payload;
  let forecastVersion 
  test.beforeAll(async ({ request }) => {
    forecastVersion = await CdfUtility.getDemandScenarioList(request);
    forecastVersion = forecastVersion.version;
    console.log("Forecast Version: ", forecastVersion);
  });
 
  test("Verify if the data is shown as per selected filters @getdemandscenario", async ({
    request
  }) => {
    getCurrentDemandForecast.payload.version = forecastVersion
    demandScenario = await CdfUtility.getDemandScenario(request, getCurrentDemandForecast.payload);
    debug.log("Demand Scenario  : ", demandScenario);
  });

})

test.describe("Verify filters are being retained in demand scenario", { tag: "@Smoke @filterRetention @ibg-service-scenario-financials @Regression" }, () => {

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