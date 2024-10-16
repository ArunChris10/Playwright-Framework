import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import forecastData from "../testdata/forecast-api.json";

const lobName = ["E2E DELIVERY"];
for (let i = 0; i < lobName.length; i++) {
  test.describe(
    "Verify create, edit and delete forecast API",
    { tag: "@Smoke @Regression @create_forecast" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });

      let scenarioId: number;
      let dimId = commonData.ba_dim_id;
      let scenario_details: number;

      test(`Delete all created forecast by automation user for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        if (
          (await ForecastUtility.countOfScenario(lobName[i], request)) ==
          commonData.MAX_SCENARIO_COUNT
        ) {
          await ForecastUtility.deleteAllforecastofUser(
            request,
            lobName[i],
            process.env.ufmUser
          );
        }
      });

      test(`Verify if the user is able to create forecast for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        scenarioId = await ForecastUtility.createForecast(lobName[i], request);
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
        let responseMessage = await ForecastUtility.createForecast(
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

      test(`Verify if the user is able to edit forecast name for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        let responseMessage = await ForecastUtility.editForecastName(
          lobName[i],
          request,
          scenario_details["scenarioId"],
          scenario_details["scenarioVersion"],
          scenario_details["name"] + " Updated by automation"
        );
        expect(responseMessage).toEqual(forecastData.editNameSuccessMessage);
      });

      test(`Verify error if the user is editing forecast name with same name for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        let responseMessage = await ForecastUtility.editForecastName(
          lobName[i],
          request,
          scenario_details["scenarioId"],
          scenario_details["scenarioVersion"],
          scenario_details["name"] + " Updated by automation",
          true
        );
        let message = forecastData.createAlreadyMessage.replace(
          "scenarioName",
          scenario_details["name"] + " Updated by automation"
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

        await ForecastUtility.deleteForecast(
          scenarioId,
          scenario_details["scenarioVersion"],
          dimId,
          await UfmUtility.getMapping(lobName[i], "dim_val_id"),
          request
        );
      });

      test(`Verify the message while deleting already deleted scenario ${lobName[i]}`, async ({
        request,
      }) => {
        let deleteResponse = await ForecastUtility.deleteForecast(
          scenarioId,
          scenario_details["scenarioVersion"],
          dimId,
          await UfmUtility.getMapping(lobName[i], "dim_val_id"),
          request,
          true
        );
        expect(deleteResponse.message).toEqual("No scenario id found");
      });
    }
  );
}
