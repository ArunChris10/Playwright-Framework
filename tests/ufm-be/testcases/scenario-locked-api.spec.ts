import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { UfmUtility } from "../fixtures/ufm-utils";

test.describe(
  "Verify getting last locked scenario",
  { tag: "@Smoke @Regression @lockedScenario @ibg-ufm-metadata-service @ibg-ufm-core-service" },
  () => {
    test.describe.configure({ timeout: 120_000, mode: "serial" });

    test("Verify if the user is able to get Last Locked Scenario", async ({
      request,
    }) => {
      let getLastLockedScenario = await UfmUtility.getLastLockedScenario(
        request
      );
      Utility.logIt(`Get last locked scenario : ${getLastLockedScenario}`);
    });
  }
);
