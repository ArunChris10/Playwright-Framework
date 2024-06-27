import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify scenario is archived", { tag: "@Smoke @archiveScenario" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let archiveScenario;
  let unarchiveScenario;

  test("Verify if the user is able to @archiveScenario", async ({
    request
  }) => {
    archiveScenario = await CdfUtility.archiveScenario(request);
    debug.log("Scenario is Archived  : ", archiveScenario);
  });

  test("Verify if the user is able to @unarchiveScenario", async ({
    request
  }) => {
    unarchiveScenario = await CdfUtility.unarchiveScenario(request);
    debug.log(JSON.stringify(unarchiveScenario));
  });
})