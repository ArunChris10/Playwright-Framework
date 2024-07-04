import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import filterScenarioCurrentDemand from '../testdata/filter-retention-current-demand.json'
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify user is able to filter scenario", { tag: "@Smoke @filterScenario" }, () => {
  let demandIdOne;
  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let filterScenario;

  test("Verify the filter retention in current demand page", async ({
    request
  }) => {
    demandIdOne = await CdfUtility.createScenario(request);
    filterScenario = await CdfUtility.filterUpdateScenarioCurrentDemand(request, demandIdOne, filterScenarioCurrentDemand.payload);
    debug.log(" user is able : ", filterScenario);
  });

  test("verify that user should be able to see the data in years , quarter and monthly view", async ({
    request
  }) => {
    demandIdOne = await CdfUtility.createScenario(request);
    filterScenario = await CdfUtility.filterScenarioCurrentDemand(request, demandIdOne);
    debug.log(" user is able : ", filterScenario);
  });
})