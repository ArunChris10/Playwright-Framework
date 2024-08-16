import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";

const lobName = commonData.lobList;

lobName.forEach((lob) => {
  test.describe(
    `Find input nodes for ${lob}`,
    { tag: "@Smoke @Regression @inputNodes" },
    () => {
      test.describe.configure({ timeout: 600_000, mode: "parallel" });

      test(`Find input nodes for ${lob} scenario`, async ({ request }) => {
        let inputnodes: string[] = [];
        inputnodes = await UfmUtility.getInputNodelist(lob, request);
        Utility.logIt(inputnodes);
      });
    }
  );
});
