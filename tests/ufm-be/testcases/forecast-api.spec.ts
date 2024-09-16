import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import forecastData from "../testdata/forecast-api.json";

const lobName = ["e2e_delivery"];
for (let i = 0; i < lobName.length; i++) {
  test.describe(
    "Verify create and delete forecast API",
    { tag: "@Smoke @Regression @create_forecast" },
    async () => {
      test.describe.configure({ timeout: 300_000, mode: "serial" });

      let scenarioId: number;
      let dimId = commonData.ba_dim_id;
      let dimValId = commonData[lobName[i]].dim_val_id;
      let scenario_details: number;

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

      test(`Verify the user get duplicate message while creating forecast with same name for the same timeperiod - ${lobName[i]}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName[i],
          request
        );

        //Get scenario version from scenario id from forecast list
        scenario_details = await UfmUtility.getScenarioDetails(
          currentForecast,
          scenarioId
        );

        // Create forecast with duplicate / same name as previously created forecast

        let responseMessage = await UfmUtility.createForecast(
          lobName[i],
          request,
          scenario_details["name"],
          true
        );

        let message = forecastData.createAlreadyMessage.replace(
          "scenarioName",
          scenario_details["name"]
        );

        expect(responseMessage).toEqual(message);
      });

      test(`Verify if the user is able to delete created forecast for LOB ${lobName[i]}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName[i],
          request
        );

        Utility.logIt(`No of scenarios present: ${currentForecast.length}`);

        await UfmUtility.deleteForecast(
          scenarioId,
          scenario_details["scenarioVersion"],
          dimId,
          dimValId,
          request
        );
      });

      test(`Verify the message while deleting already deleted scenario ${lobName[i]}`, async ({
        request,
      }) => {
        let deleteResponse = await UfmUtility.deleteForecast(
          scenarioId,
          scenario_details["scenarioVersion"],
          dimId,
          dimValId,
          request,
          true
        );
        expect(deleteResponse.message).toEqual("No scenario id found");
      });
    }
  );
}
