import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";

const lobName = [
  commonData.lobList[10],
  commonData.lobList[13],
  commonData.lobList[4],
];

test.describe(
  "Create and edit adjustment",
  { tag: "@Smoke @Regression @adjustments" },
  async () => {
    test.describe.configure({ mode: "parallel" });
    lobName.forEach((lobName) => {
      test.describe(async () => {
        let scenarioId: number, scenarioVersion: number, adjustment_id: number;
        test.describe.configure({ mode: "serial" });

        test(`Delete all created forecast by automation user for LOB - ${lobName}`, async ({
          request,
        }) => {
          await UfmUtility.deleteAllforecastofUser(
            request,
            lobName,
            process.env.ufmUser
          );
        });
        test(`Verify if the user is able to createforecast for LOB - ${lobName}`, async ({
          request,
        }) => {
          scenarioId = await UfmUtility.createForecast(lobName, request);
        });

        test(`Get Scenario version for created forecast ${lobName}`, async ({
          request,
        }) => {
          let currentForecast = await UfmUtility.getCurrentForecastList(
            lobName,
            request
          );
          Utility.logIt(`No of scenarios present: ${currentForecast.length}`);

          //Get scenario version from scenario id from forecast list
          scenarioVersion = await UfmUtility.getScenarioVersion(
            currentForecast,
            scenarioId
          );
        });

        test(`Create adjustment for ${lobName}`, async ({ request }) => {
          adjustment_id = await UfmUtility.createAdjustment(
            scenarioId,
            scenarioVersion,
            lobName,
            request
          );
        });

        test(`delete created scenario ${lobName}`, async ({ request }) => {
          await UfmUtility.deleteForecast(
            scenarioId,
            scenarioVersion,
            commonData.ba_dim_id,
            commonData[lobName].dim_val_id,
            request
          );
        });
      });
    });
  }
);
