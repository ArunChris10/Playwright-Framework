import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";

test.describe("Verify allocation layer  Aur constant", { tag: "@Regression @ibg-service-scenario-financials @allocationLayer" }, () => {
  test.describe.configure({ timeout: 180_000, mode: 'serial' });
  
  let scenarioID ;
  let response;
  let demandScenarioDetails;


  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request,scenarioID);
  });

 

  test("Verify allocation layer  Aur constant @allocationLayer", async ({
    request
  }) => {
    let scenarioNew
    await test.step("Verify scenario creation", async () => {
      scenarioNew = await CdfUtility.createScenario(request);
    });
    await test.step("Verify get Demand Stack Details", async () => {
      demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
        request,
        scenarioNew
      );
    });
    scenarioID = scenarioNew
    console.log(scenarioID)
    await test.step("Verify market Split Aur Constant", async () => {
      response = await AllocationUtils.marketSplitAurConstant(request,scenarioID,demandScenarioDetails);
    });
    debug.log("allocation layer  Aur constant  for market Split created: ", response);
  });

})