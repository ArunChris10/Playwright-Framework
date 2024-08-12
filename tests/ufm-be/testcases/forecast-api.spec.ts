import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { UfmUtility } from "../fixtures/ufm-utils";
import forecastData from "../testdata/forecast-api.json";
import commonData from "../testdata/common.json";

test.describe(
  "Verify create and delete forecast API",
  { tag: "@Smoke @Regression @create_forecast" },
  () => {
    test.describe.configure({ timeout: 240_000, mode: "serial" });

    let lobName = [
      // "optical",
      // "rx",
      // "merch",
      "ecommerce",
      "lmd",
      // "e2e_delivery",
      "core_service",
      // "fulfillment",
      // "i&a",
      // "connect",
      // "marketing",
      "data_ventures",
      "operations",
      // "real_estate",
      // "fuel",
      "segment",
      // "home_office",
    ];

    lobName.forEach((lobName) => {
      let scenario_version, scenario_id;
      let dimId = commonData.ba_dim_id;
      let dimValId = commonData[lobName].dim_val_id;

      test(`Verify if the user is able to createforecast for LOB - ${lobName}`, async ({
        request,
      }) => {
        scenario_id = await UfmUtility.createForecast(lobName, request);
      });

      test(`Verify if the user is able to delete created forecast for LOB ${lobName}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName,
          request
        );
        console.log(`No of scenarios present: ${currentForecast.length}`);
        debug.log(`No of scenarios present: ${currentForecast.length}`);

        //Get scenario version from scenario id from forecast list
        scenario_version = await UfmUtility.getScenarioVersion(
          currentForecast,
          scenario_id
        );

        console.log(scenario_version);
        debug.log(scenario_version);
        await UfmUtility.deleteForecast(
          scenario_id,
          scenario_version,
          dimId,
          dimValId,
          request
        );
      });
    });
  }
);
