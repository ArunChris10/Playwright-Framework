import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { UfmUtility } from "../fixtures/ufm-utils";
import forecastData from "../testdata/forecast-api.json";

test.describe(
  "Verify create and delete forecast API",
  { tag: "@Smoke @Regression @forecast" },
  () => {
    test.describe.configure({ timeout: 240_000, mode: "serial" });

    let lobName = ["optical", "merch"];

    lobName.forEach((lobName) => {
      let scenario_version, scenario_id;
      let dimId = forecastData.createForecastPayloads[lobName].dim_id;
      let dimValId = forecastData.createForecastPayloads[lobName].dim_val_id;

      test(`Verify if the user is able to createforecast for LOB - ${lobName}`, async ({
        request,
      }) => {
        scenario_id = await UfmUtility.createForecast(lobName, request);
        debug.log("Forecast is created  : ", scenario_id);
        console.log("Forecast is created  : ", scenario_id);
      });

      test(`Verify if the user is able to delete created forecast for LOB ${lobName}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecast(
          lobName,
          request
        );
        console.log(`No of scenarios present: ${currentForecast.length}`);
        debug.log(`No of scenarios present: ${currentForecast.length}`);

        for (let i = 0; i < currentForecast.length; i++) {
          console.log(currentForecast[i]);
          if (currentForecast[i].scenarioId == scenario_id) {
            console.log(
              `Scenario Version: ${currentForecast[i].scenarioVersion}`
            );
            scenario_version = currentForecast[i].scenarioVersion;
            break;
          }
        }

        console.log(scenario_version);
        debug.log(scenario_version);
        let forecastDeleted = await UfmUtility.deleteForecast(
          scenario_id,
          scenario_version,
          dimId,
          dimValId,
          request
        );
        debug.log("Forecast is deleted  : ", forecastDeleted);
        console.log("Forecast is deleted  : ", forecastDeleted);
        let message = forecastData.deleteMessage.replace(
          "scenario_id",
          scenario_id
        );
        expect(forecastDeleted.message).toEqual(message);
        debug.log(JSON.stringify(forecastDeleted));
      });
    });
  }
);
