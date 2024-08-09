import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";

test.describe("Verify allocation layer  Preview", { tag: "@Regression @ibg-service-scenario-financials @allocationLayer" }, () => {
  test.describe.configure({ timeout: 180_000, mode: 'serial' });
  
  let scenarioID ;
  let scenarioID2;
  let response;
  let demandScenarioDetails;


  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request,scenarioID);
    await CdfUtility.deleteScenario(request,scenarioID2);
  });

 

  test("Verify if the user is able to create Allocation Layer Unscheduled Delivery Split Preview @allocationLayer", async ({
    request
  }) => {
    let scenarioNew = await CdfUtility.createScenario(request);
    demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
      request,
      scenarioNew
    );
    scenarioID = scenarioNew
    console.log(scenarioID)
    response = await AllocationUtils.createAllocationLayerUnscheduledDeliverySplitPreview(request,scenarioID,demandScenarioDetails);
    debug.log("Preview for Unscheduled Delivery Split created: ", response);
  });

  test("Verify if the user is able to create Allocation Layer Market Split Preview @allocationLayer", async ({
    request
  }) => {
    let scenarioNew = await CdfUtility.createScenario(request);
    demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
      request,
      scenarioNew
    );
    scenarioID2 = scenarioNew
    console.log(scenarioID)
    response = await AllocationUtils.createAllocationLayerMarketSplitPreview(request,scenarioID2,demandScenarioDetails);
    debug.log("Preview for Market Split created: ", response);
  });


})