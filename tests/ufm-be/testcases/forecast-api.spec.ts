import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import forecastData from "../testdata/forecast-api.json";

const lobName = ["MARKETPLACE"];
for (let i = 0; i < lobName.length; i++) {
  test.describe(
    "Verify create, edit and delete forecast API",
    { tag: "@Smoke @Regression @create_forecast ibg-ufm-metadata-service ibg-ufm-core-service" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });

      let scenarioId: number;
      let dimId = commonData.ba_dim_id;
      let scenario_details: number;

      test(`Delete all created forecast by automation user for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        if (
          (await ForecastUtility.countOfScenario(
            lobName[i],
            process.env.ufmUser,
            request
          )) >= commonData.MAX_SCENARIO_COUNT
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
          scenario_details["scenarioId"],
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
          scenario_details["scenarioId"],
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

const lob = [
  "CONSOLIDATED DEMAND",
  "INSTORE AND OTHER",
  "SCHEDULED",
  "UNSCHEDULED AND CORE",
  "MARKETPLACE"];
lob.forEach((lobName) => {
  test.describe(
    "Verify create forecast API for multiple LOBs",
    { tag: "@Smoke @Regression @multipleForecast" },
    async () => {
      test.describe.configure({ timeout: 600_000, mode: "parallel" });

      test(`Validate multiple LOB forecast creation ${lobName}`, async ({ request }) => {
        if (
          (await ForecastUtility.countOfScenario(
            lobName,
            process.env.ufmUser,
            request
          )) >= commonData.MAX_SCENARIO_COUNT
        ) {
          await ForecastUtility.deleteAllforecastofUser(
            request,
            lobName,
            process.env.ufmUser
          );
        }

        let scenarioId = await ForecastUtility.createForecast(
          lobName,
          request
        );

        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName,
          request
        );

        //Get scenario version from scenario id from forecast list
        let scenario_details = await UfmUtility.getScenarioDetails(
          currentForecast,
          scenarioId
        );

        await ForecastUtility.deleteForecast(
          scenario_details["scenarioId"],
          scenario_details["scenarioVersion"],
          commonData.ba_dim_id,
          await UfmUtility.getMapping(lobName, "dim_val_id"),
          request
        );
      });
    }
  );
});
