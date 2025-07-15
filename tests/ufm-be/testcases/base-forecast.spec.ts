import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import PBASBAList from "../constants/PBA_SBA_List.json";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import testdatafile from "../testdata/historical-forecast.json";
import usersData from "../constants/ufm_users.json";

let lobList = PBASBAList.SBAList;

lobList.forEach((lobName) => {
  test.describe(
    "Validation of Base Forecast List",
    { tag: "@Regression @Smoke @Base_Forecast @perf" },
    () => {
      let responseData;
      // API endpoint URL
      const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;

      Utility.logIt(endpointURL);
      let userList = usersData.users;

      userList.forEach(async (user) => {
        test(`For User ${user} Check the list of base forecast for ${lobName}`, async ({
          request,
        }) => {
          responseData = await request.get(endpointURL, {

            params: {
              dim_id: commonData.lob_dim_id,
              classification_id: commonData.classification_id,
              dim_val_id: await UfmUtility.getMapping(
                lobName,
                "dim_val_id",
                "SBA"
              ),
              data_level: commonData.lob_dim_id,
              include_primary: true,
            },
          });
          Utility.assertAndLog(responseData);
        });
      });
    }
  );
});
