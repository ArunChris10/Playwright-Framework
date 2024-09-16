import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import adjustmentData from "../testdata/adjustment.json";

const lobName = [
  commonData.lobList[10],
  commonData.lobList[13],
  commonData.lobList[4],
];

lobName.forEach((lobName) => {
  test.describe(
    "Create and edit adjustment",
    { tag: "@Smoke @Regression @adjustments" },
    async () => {
      let scenarioId: number, scenario_details, adjustment_metadata;
      test.describe.configure({ timeout: 400_000, mode: "serial" });

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
        scenario_details = await UfmUtility.getScenarioDetails(
          currentForecast,
          scenarioId
        );
      });

      test(`Create adjustment for ${lobName}`, async ({ request }) => {
        adjustment_metadata = await UfmUtility.createAdjustment(
          scenarioId,
          scenario_details['scenarioVersion'],
          lobName,
          request
        );
      });


      test(`Get all adjustments with valid scenario_id and scenario_version_number for ${lobName}`, async ({ request }) => {

        let response = await UfmUtility.getAllAdjustments(
          scenarioId,
          scenario_details['scenarioVersion'],
          lobName,
          request
        )
        await expect
          .soft(adjustment_metadata.adjustment_id)
          .toEqual(response.adjustment_id);

        await expect
          .soft(adjustment_metadata.adjustment_name)
          .toEqual(response.adjustment_name);

        await expect
          .soft(adjustment_metadata.adjustment_reason)
          .toEqual(response.adjustment_reason);


      })

      test(`Get all adjustments with invalid scenario_id and valid scenario_version_number for ${lobName}`, async ({ request }) => {
        //get all adjustments with both values invalid
        let response = await UfmUtility.getAllAdjustments(
          123,
          123,
          lobName,
          request,
          true
        )

        await expect
          .soft(adjustmentData.getErrorMessage)
          .toEqual(response.message);

        //get all adjustments with scenario id invalid

        response = await UfmUtility.getAllAdjustments(
          scenarioId,
          123,
          lobName,
          request,
          true
        )

        await expect
          .soft(adjustmentData.getErrorMessage)
          .toEqual(response.message);

        //get all adjustments with scenario version invalid

        response = await UfmUtility.getAllAdjustments(
          123,
          scenario_details['scenarioVersion'],
          lobName,
          request,
          true
        )

        await expect
          .soft(adjustmentData.getErrorMessage)
          .toEqual(response.message);

      })

      test(`Delete the created adjustment with valid adjustment id for ${lobName}`, async ({ request }) => {
        let response = await UfmUtility.deleteAdjustment(
          adjustment_metadata.adjustment_id,
          scenarioId,
          scenario_details['scenarioVersion'],
          request
        )

        await expect
          .soft(adjustment_metadata.adjustment_id)
          .toEqual(response.adjustment_id);

        await expect
          .soft(response.message)
          .toEqual(`Adjustment deleted successfully for adjustment_id: ${adjustment_metadata.adjustment_id}`);

      })

      test(`Delete the adjustment with invalid adjustment id for ${lobName}`, async ({ request }) => {
        let response = await UfmUtility.deleteAdjustment(
          123,
          scenarioId,
          scenario_details['scenarioVersion'],
          request,
          true
        )

        await expect
          .soft(response.message)
          .toEqual(`Adjustment details not found or inactive with the adjustment_id provided.`);

      })

      // Need to add one case for invalid scenario id and version currently bug is there once resolved we can add .

      test(`delete created scenario ${lobName}`, async ({ request }) => {
        await UfmUtility.deleteForecast(
          scenarioId,
          scenario_details['scenarioVersion'],
          commonData.ba_dim_id,
          commonData[lobName].dim_val_id,
          request
        );
      });
    });
});
