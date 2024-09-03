import { test } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";

test.describe("Verify allocation layer  base channel constant", { tag: "@Regression @ibg-service-scenario-financials @allocationLayer" }, () => {
  test.describe.configure({ timeout: 180_000, mode: 'serial' });
  
  let scenarioID ;
  let response;
  let demandScenarioDetails;


  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request,scenarioID);
  });

 

  test("Verify allocation layer base channel constant @allocationLayer", async ({
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
    await test.step("Verify market Split base channel Constant", async () => {
      response = await AllocationUtils.demandChannelConstCheck(request,scenarioID,demandScenarioDetails);
    });
    debug.log("Verify Totals of demand channel value will not change based on changes in base channel values: ", response);
  });

})
