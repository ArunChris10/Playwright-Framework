import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify scenario is archived", { tag: "@Smoke @archiveScenario @ibg-service-scenario-financials @Regression" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let archiveScenario;
  let unarchiveScenario;
  let demandId;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify if the user is able to @archiveScenario", async ({
    request
  }) => {
    archiveScenario = await CdfUtility.archiveScenario(request, demandId);
    debug.log("Scenario is Archived  : ", archiveScenario);
  });

  test("Verify if the user is able to @unarchiveScenario", async ({
    request
  }) => {
    unarchiveScenario = await CdfUtility.unarchiveScenario(request, demandId);
    debug.log(JSON.stringify(unarchiveScenario));
  });
})