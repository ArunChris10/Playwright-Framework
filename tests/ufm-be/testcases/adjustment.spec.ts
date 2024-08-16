import { test, expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import testdata from "../testdata/adjustment.json";
import commonData from "../testdata/common.json";
import debug from "debug";

let lobName = [
  // "optical",
  // "rx",
  // "merch",
  // "ecommerce",
  // "lmd",
  // "e2e_delivery",
  // "core_service",
  // "fulfillment",
  // "i&a",
  // "connect",
  "marketing",
  // "data_ventures",
  // "operations",
  // "real_estate",
  // "fuel",
  // "segment",
  // "home_office",
];

lobName.forEach((lobName) => {
  test.describe(
    "Create and edit adjustment",
    { tag: "@Smoke @adjustments" },
    () => {
      let scenario_id, scenario_version, adjustment_id;
      test.describe.configure({ timeout: 400_000, mode: "serial" });

      test(`Verify if the user is able to createforecast for LOB - ${lobName}`, async ({
        request,
      }) => {
        scenario_id = await UfmUtility.createForecast(lobName, request);
      });

      test(`Get Scenario version for created forecast ${lobName}`, async ({
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
      });

      test(`Create adjustment for ${lobName}`, async ({ request }) => {
        adjustment_id = await UfmUtility.createAdjustment(
          scenario_id,
          scenario_version,
          lobName,
          request
        );
      });

      test(`delete created scenario`, async ({ request }) => {
        await UfmUtility.deleteForecast(
          scenario_id,
          scenario_version,
          commonData.ba_dim_id,
          commonData[lobName].dim_val_id,
          request
        );
      });
    }
  );
});
