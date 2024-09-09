import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify scenario ", { tag: "@Smoke @scenario @ibg-service-scenario-financials @Regression" }, () => {

  test.describe.configure({ timeout: 180_000, mode: 'serial' });
  
  let scenarioID ;
  let response;
  let cloneScenarioID;

  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request,scenarioID);
    await CdfUtility.deleteScenario(request,cloneScenarioID);
  });


  test("Verify if the user is able to create  @scenario", async ({
    request
  }) => {
    scenarioID = await CdfUtility.createScenario(request);
    //let scenarioNew = await CdfUtility.createNewScenario(request);
    //scenarioID = scenarioNew.demandStackScenarioId
    debug.log("Scenario is created  : ", scenarioID);
  });

  test("Verify if the user is able to clone to new @scenario", async ({
    request
  }) => {
    let cloneScenario = await CdfUtility.cloneToNewScenario(request,scenarioID);
    cloneScenarioID = cloneScenario.demandStackDTO.demandStackScenarioId;
    await CdfUtility.checkClonedJobStatus(request,cloneScenario.demandStackDTO.demandStackScenarioId)
    debug.log("Scenario is clone  : ", cloneScenarioID);
  });

  test("Verify if the user is able to freeze @scenario", async ({
    request
  }) => {
    response = await CdfUtility.freezeScenario(request,scenarioID);
    debug.log("Scenario is Freeze  : ", scenarioID);
  });

  test("Verify if the user is able to unfreeze @scenario", async ({
    request
  }) => {
    response = await CdfUtility.UnFreezeScenario(request,scenarioID);
    debug.log("Scenario is UnFreeze  : ", scenarioID);
  });

  test("Verify if the user is able to delete @scenario", async ({
    request
  }) => {
    response = await CdfUtility.deleteScenario(request,scenarioID);
    debug.log("Scenario is UnFreeze  : ", scenarioID);
  });

})