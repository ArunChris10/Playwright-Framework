import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { UfmUtility } from "../fixtures/ufm-utils";

test.describe(
  "Verify getting last locked scenario",
   { tag: "@Smoke @Regression" },
  () => {
  test.describe.configure({ timeout: 120_000, mode: "serial" });

  test("Verify if the user is able to @getLastLockedScenario", async ({
    request,
  }) => {
    let getLastLockedScenario = await UfmUtility.getLastLockedScenario(
      request
      );
    debug.log("Get last locked scenario  : ", getLastLockedScenario);
  });
}
)