import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import dataList from "../constants/PBA_SBA_List.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import usersData from "../constants/ufm_users.json";

const lobName = dataList.SBAList;

lobName.forEach((lob) => {
  test.describe(
    `Find input nodes for ${lob}`,
    { tag: "@Smoke @Regression @inputNodes @perf" },
    () => {
      test.describe.configure({ timeout: 600_000, mode: "parallel" });
      let userList = usersData.users;

      userList.forEach(async (user) => {
        test(`Find input nodes for user ${user} for ${lob} scenario`, async ({
          request,
        }) => {
          let nexusTokens = await Utility.getNexusFakeToken(user, request);
          let inputnodes = await UfmUtility.getDriverList(
            lob,
            "Input",
            request,
            nexusTokens
          );
          for (const inputNode of inputnodes) {
            const { node_var_name, node_name, node_grain } = inputNode;

            Utility.logIt(
              "Node name - " +
                node_name +
                " Node var name - " +
                node_var_name +
                " Node grains - " +
                node_grain
            );
          }
        });
      });
    }
  );
});
