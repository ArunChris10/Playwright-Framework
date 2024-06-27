import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify scenario is archived", { tag: "@Smoke @getdemandscenario" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let demandScenario;

  test("Verify if the data is shown as per selected filters @getdemandscenario", async ({
    request
  }) => {
    demandScenario = await CdfUtility.getDemandScenario(request);
    debug.log("Demand Scenario  : ", demandScenario);
  });

})