import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify user is able to get current demand forecast on currentdemand page", { tag: "@Smoke @currentDemand" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let currentDemandScenario;

  test("verify that user should be able to see the data in Million , Billion and Absolute view", async ({
    request
  }) => {
    currentDemandScenario = await CdfUtility.getCurrentDemandForecast(request);
    debug.log(" user is able : ",currentDemandScenario );
  });
})