import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";

const lobName = ["merch", "e2e_delivery"];
for (let i = 0; i < lobName.length; i++) {
  test.describe(
    "Verify create and delete forecast API",
    { tag: "@Smoke @Regression @create_forecast" },
    async () => {
      test.describe.configure({ timeout: 300_000, mode: "serial" });

      let scenarioId: number;
      let dimId = commonData.ba_dim_id;
      let dimValId = commonData[lobName[i]].dim_val_id;

      test(`Delete all created forecast by automation user for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        await UfmUtility.deleteAllforecastofUser(
          request,
          lobName[i],
          process.env.ufmUser
        );
      });

      test(`Verify if the user is able to create forecast for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        scenarioId = await UfmUtility.createForecast(lobName[i], request);
      });

      test(`Verify if the user is able to delete created forecast for LOB ${lobName[i]}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName[i],
          request
        );
        Utility.logIt(`No of scenarios present: ${currentForecast.length}`);

        //Get scenario version from scenario id from forecast list
        let scenario_version = await UfmUtility.getScenarioVersion(
          currentForecast,
          scenarioId
        );

        Utility.logIt(scenario_version);
        await UfmUtility.deleteForecast(
          scenarioId,
          scenario_version,
          dimId,
          dimValId,
          request
        );
      });
    }
  );
}
