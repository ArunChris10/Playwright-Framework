import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import getCurrentDemandForecast from '../testdata/get-currentdemand-scenario-forecast.json'
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