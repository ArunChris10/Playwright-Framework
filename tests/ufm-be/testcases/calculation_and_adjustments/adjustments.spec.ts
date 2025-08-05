import { expect, test } from "../../../common/fixtures/test-hook";
import commonData from "../../constants/common.json";
import { payloads, testData } from "../../testdata/adjustment.json"
import { AdjustmentUtility } from "../../fixtures/adjustment-utils";
import { ForecastUtility } from "../../fixtures/forecast-utils";
import { UfmUtility } from "../../fixtures/ufm-utils";

Object.entries(testData).forEach(([lob, testData]) => {

  let scenario_details;
  let adjustment_metadata;
  let adjustment_id;
  let adjustmentDetails: any;
  let getAllAdjustmentsCountBefore;
  let getAllAdjustmentsCountAfter;
  let responseBody;

  test.describe(
    "Verify adjustments API",
    { tag: "@Smoke @Regression @adjustments @ibg-ufm-domino-service @ibg-ufm-metadata-service @ibg-ufm-core-service @ibg-ufm-allocation-engine" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });

      test(`Getting or creating forecast for LOB - ${testData.lobName}`, async ({
        request,
      }) => {
        if (
          (await ForecastUtility.countOfScenario(
            testData.lobName,
            process.env.ufmUser,
            request
          )) >= commonData.MAX_SCENARIO_COUNT
        ) {
          await ForecastUtility.deleteAllforecastofUser(
            request,
            testData.lobName,
            process.env.ufmUser
          );
        }
        //Getting forecast details
        const scenarioId =
          await ForecastUtility.createForecast(
            testData.lobName,
            request
          );

        let currentForecast = await UfmUtility.getCurrentForecastList(
          testData.lobName,
          request
        );

        scenario_details = await UfmUtility.getScenarioDetails(
          currentForecast,
          scenarioId
        );
        console.log("scenario_details", scenario_details)
      });

      test(`Verify newly created scenario doesn't contain any adjustments for - ${testData.lobName}`, async ({
        request,
      }) => {

        let getAllAdjustments = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        expect(getAllAdjustments).toEqual([])

      });


      test(`Verify user able to add adjustment to a scenario for - ${testData.lobName} with type Initiative 73`, async ({
        request,
      }) => {

        getAllAdjustmentsCountBefore = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        adjustmentDetails = await AdjustmentUtility.createAdjustment(scenario_details["scenarioId"], scenario_details["scenarioVersion"],
          { ...payloads.adjustment_metadata },
          testData.lobName, request)

        getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)
        expect(getAllAdjustmentsCountBefore.length).toEqual(getAllAdjustmentsCountAfter.length - 1)
      });


      test(`Verify user able to add adjustment to a scenario for - ${testData.lobName} with type Adjustment 74`, async ({
        request,
      }) => {

        adjustment_metadata = { "adjustment_type": 74 }

        getAllAdjustmentsCountBefore = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        let adjustmentDetails = await AdjustmentUtility.createAdjustment(scenario_details["scenarioId"], scenario_details["scenarioVersion"],
          { ...payloads.adjustment_metadata, ...adjustment_metadata },
          testData.lobName, request)

        getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        expect(getAllAdjustmentsCountBefore.length).toEqual(getAllAdjustmentsCountAfter.length - 1)

        adjustment_id = adjustmentDetails["adjustment_id"]

      });

      test(`Verify user is able to update just adjustment for - ${testData.lobName}`, async ({ request }) => {

        adjustment_metadata = {
          "adjustment_id": adjustment_id,
          "is_create": false,
          "is_duplicated": false,
          "is_update": true
        }

        getAllAdjustmentsCountBefore = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        await AdjustmentUtility.createAdjustment(scenario_details["scenarioId"], scenario_details["scenarioVersion"],
          { ...payloads.adjustment_metadata, ...adjustment_metadata },
          testData.lobName, request)

        getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        expect(getAllAdjustmentsCountBefore.length).toEqual(getAllAdjustmentsCountAfter.length)
      })


      test(`Verify user able to delete adjustment - ${testData.lobName}`, async ({
        request,
      }) => {

        responseBody = await AdjustmentUtility.deleteAdjustment(adjustment_id, scenario_details["scenarioId"], scenario_details["scenarioVersion"], request)

        expect.soft(responseBody.adjustment_id).toEqual(adjustment_id)

        expect.soft(responseBody.message).toEqual(`Adjustment deleted successfully for adjustment_id: ${adjustment_id}`)


      });

      test(`Teardown for deleting forecast for lob - ${testData.lobName}`, async ({
        request,
      }) => {

        await ForecastUtility.deleteForecast(
          scenario_details["scenarioId"],
          scenario_details["scenarioVersion"],
          commonData.ba_dim_id,
          await UfmUtility.getMapping(testData.lobName, "dim_val_id"),
          request
        );
      });
    }
  );
})


