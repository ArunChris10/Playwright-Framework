import { expect, test } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { testData } from "../testdata/multiLayerAdjustmentdata.json";
import adjustmentData from "../testdata/adjustment.json";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import { Utility } from "../../common/fixtures/utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { Root } from "../fixtures/allocate-utils";
export interface NodeDimension { };
export interface filters extends Array<any> { };

Object.entries(testData).forEach(([lobName, testData]) => {

  let scenarioId;
  let scenarioVersion;
  let node_dimension: NodeDimension = {};
  let node_filters: filters = [];
  let scenario_details = [];
  let baselineValuesMap: Record<string, number[]> = {};
  let layer1_forecastValueMap: Record<string, number[]> = {};
  let layer2_forecastValueMap: Record<string, number[]> = {};
  let layer1_previousValueMap: Record<string, number[]> = {};
  let layer2_previousValueMap: Record<string, number[]> = {};
  let inputMonths: string[] = [];
  let allocationMethod: number = commonData["Maintain Ratio"];


  test.describe("Verify Calculate & Save API for multiple adjustments", { tag: "@Smoke @Regression @multiLayeradjustment" }, () => {

    test.beforeAll(async ({ request }) => {
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

      // Getting forecast details
      [scenario_details] = await ForecastUtility.getOrCreateForecastIfNotExists(
        testData.lobName,
        request
      );

      scenarioId = scenario_details["scenarioId"];
      scenarioVersion = scenario_details["scenarioVersion"];
    });

    test.describe.configure({ timeout: 500_000, mode: "serial" });

    test(`Verify calculate & Save 1st layer of adjustment is done for LoB - ${lobName}`, async ({
      request,
    }) => {
      inputMonths = await Utility.generateNextMonths(5);
      let baseline_KpiResponse = await EditForecastUtility.getKpiResponsesForNodes(
        testData.Nodes,
        lobName,
        scenarioId,
        inputMonths,
        node_dimension,
        node_filters,
        request
      );
      let baselineValue_default = await EditForecastUtility.captureValuesFromKpiResponses(
        baseline_KpiResponse,
        testData.Nodes,
        inputMonths ,
        baselineValuesMap,
        node_dimension,
        "baseline"
      );
      console.log("BaselinevaluesMap:", JSON.stringify(baselineValue_default, null, 2));
      const { obj, months } = await EditForecastUtility.createAllocationPayloadfor1Year(lobName, scenarioId, allocationMethod, node_dimension, inputMonths, node_filters);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);

      // Validate through assertions
      await EditForecastUtility.validateForecastOnCalculate(responseBody, obj);
      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      //let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId_FirstLayer = saveResponse.adjustment_metadata.adjustment_id;
      /* const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId_FirstLayer
      ); 
      expect(isAdjustmentIdPresent).toBeTruthy(); */
      let layer1_KpiResponse = await EditForecastUtility.getKpiResponsesForNodes(
        testData.Nodes,
        lobName,
        scenarioId,
        inputMonths,
        node_dimension,
        node_filters,
        request,
        adjustmentId_FirstLayer
      );
      console.log("layer1_KpiResponse:", JSON.stringify(layer1_KpiResponse, null, 2));
      let layer1_actualForecastValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer1_KpiResponse,
        testData.Nodes,
        inputMonths ,
        layer1_forecastValueMap,
        node_dimension,
        "forecast"
      );
      console.log("layer1_actualForecastValue:", JSON.stringify(layer1_actualForecastValue, null, 2));
      let layer1_actualPreviousValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer1_KpiResponse,
        testData.Nodes,
        inputMonths ,
        layer1_previousValueMap,
        node_dimension,
        "previous"
      )
      console.log("layer1_actualPreviousValue:", JSON.stringify(layer1_actualPreviousValue, null, 2));
    });
  });
});