import { expect, test } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { testData } from "../testdata/editForecast.json"
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import { Utility } from "../../common/fixtures/utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
export interface NodeDimension { };

Object.entries(testData).forEach(([lobName, testData]) => {

  let scenario_details;
  let scenarioId;
  let scenarioVersion;
  let node_dimension: NodeDimension = {};

  test.describe(
    "Verify Calculate & Save API",
    { tag: "@Smoke @Regression @adjustment" },
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
        [scenario_details] =
          await ForecastUtility.getOrCreateForecastIfNotExists(
            testData.lobName,
            request
          );

        console.log("Scenario details", scenario_details);
      }); 

      test(`Verify calculate when allocation method with maintain ratio is applied on non-additive node for LoB - ${lobName}`, async ({
        request,
      }) => {
        scenarioId = scenario_details["scenarioId"];
        const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["NonAdditive"], node_dimension, request);
        const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
        let response = await request.post(endpointURL, {
          data: obj,
        });
        let responseBody = await Utility.assertAndLog(response);

        // Validate through assertions
        await EditForecastUtility.validateForecastResponse(responseBody, obj, baselineValuesMap, months);
      });

      test(`Verify calculate when allocation method with maintain ratio is applied on additive node for LoB - ${lobName}`, async ({
        request,
      }) => {
        scenarioId = scenario_details["scenarioId"];
        const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["Additive"], node_dimension, request);
        const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
        let response = await request.post(endpointURL, {
          data: obj,
        });
        let responseBody = await Utility.assertAndLog(response);
        //Adding Assertions
        await EditForecastUtility.validateForecastResponse(responseBody, obj, baselineValuesMap, months);
      });

      
    }
  );
})

