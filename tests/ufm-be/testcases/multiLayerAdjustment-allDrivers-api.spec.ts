import { expect, test } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { testData } from "../testdata/multiLayerAdjustmentdata.json";
import adjustmentData from "../testdata/adjustment.json";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import { Utility } from "../../common/fixtures/utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
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
  let forecastValuesMap: Record<string, number[]> = {};
  let layer1_forecastValueMap: Record<string, number[]> = {};
  let layer2_forecastValueMap: Record<string, number[]> = {};
  let layer1_previousValueMap: Record<string, number[]> = {};
  let layer2_previousValueMap: Record<string, number[]> = {};
  let layer1_baselineValueMap: Record<string, number[]> = {};
  let layer2_baselineValueMap: Record<string, number[]> = {};
  let baselineValue_default;
  let layer1_baselineValue;
  let layer1_actualForecastValue;
  let layer1_actualPreviousValue;
  let inputMonths: string[] = [];
  let allocationMethod: number = commonData["Maintain Ratio"];
  let driverList


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
      driverList = await UfmUtility.getDriverList(
        testData.lobName,
        "Input", request);
      //console.log("driverList:", JSON.stringify(driverList, null, 2));
      // Getting forecast details
      [scenario_details] = await ForecastUtility.getOrCreateForecastIfNotExists(
        testData.lobName,
        request
      );

      const createdScenarioId = await ForecastUtility.createForecast(lobName, request);
      let currentForecast = await UfmUtility.getCurrentForecastList(
        lobName,
        request
      );

      scenario_details = await UfmUtility.getScenarioDetails(
        currentForecast,
        createdScenarioId
      );

      scenarioId = scenario_details["scenarioId"];
      scenarioVersion = scenario_details["scenarioVersion"];
      /* driverList = await UfmUtility.getDriverList(
        testData.lobName,
        "Input", request)
        console.log("driverList:", JSON.stringify(driverList, null, 2)); */

    });

    test.describe.configure({ timeout: 500_000, mode: "serial" });

    test(`Verify calculate & Save 1st layer of adjustment is done for LoB - ${lobName}`, async ({
      request,
    }) => {
      console.log("*******LAYER 1 ADJUSTMENT******************");
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
      baselineValue_default = await EditForecastUtility.captureValuesFromKpiResponses(
        baseline_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "baseline"
      );
      let forecastValue_default = await EditForecastUtility.captureValuesFromKpiResponses(
        baseline_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "forecast"
      );
      console.log("BaselinevaluesMap:", JSON.stringify(baselineValue_default, null, 2));
      const { obj, months } = await EditForecastUtility.createAllocationPayloadfor1Year(lobName, scenarioId, allocationMethod, node_dimension, inputMonths, node_filters);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);

      // Validate through assertions
      let layer1_calculateForecast = await EditForecastUtility.validateForecastOnCalculate(responseBody, obj);
      console.log("layer1_calculateForecast:", JSON.stringify(layer1_calculateForecast, null, 2));
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
      //console.log("layer1_KpiResponse:", JSON.stringify(layer1_KpiResponse, null, 2));
      layer1_baselineValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer1_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "baseline"
      )
      console.log("layer1_baselineValue:", JSON.stringify(layer1_baselineValue, null, 2));
      layer1_actualForecastValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer1_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "forecast"
      );
      console.log("layer1_ForecastValue:", JSON.stringify(layer1_actualForecastValue, null, 2));
      layer1_actualPreviousValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer1_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "previous"
      )
      console.log("layer1_PreviousValue:", JSON.stringify(layer1_actualPreviousValue, null, 2));
      // Add assertions for calcuations
      let layer1_baselineComparisonResult = await EditForecastUtility.compareTwoResponseMaps(baselineValue_default, layer1_baselineValue)
      expect(layer1_baselineComparisonResult).toBeTruthy();
      console.log("layer1_baselineComparisonResult",+layer1_baselineComparisonResult)
      let layer1_previousComparisonResult = await EditForecastUtility.compareTwoResponseMaps(baselineValue_default, layer1_actualPreviousValue)
      expect(layer1_previousComparisonResult).toBeTruthy();
      console.log("layer1_previousComparisonResult",+layer1_previousComparisonResult)
      let layer1_forecastComparisonResult = await EditForecastUtility.compareTwoResponseMaps(layer1_calculateForecast, layer1_actualForecastValue)
      expect(layer1_forecastComparisonResult).toBeTruthy();
      console.log("layer1_forecastComparisonResult",+layer1_forecastComparisonResult)
    });

    test(`Verify calculate & Save 2nd layer of adjustment is done for LoB - ${lobName}`, async ({
      request,
    }) => {
      console.log("*******LAYER 2 ADJUSTMENT******************");
      const { obj, months } = await EditForecastUtility.createAllocationPayloadfor1Year(lobName, scenarioId, allocationMethod, node_dimension, inputMonths, node_filters);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);

      // Validate through assertions
      let layer2_calculateForecast = await EditForecastUtility.validateForecastOnCalculate(responseBody, obj);
      console.log("layer2_calculateForecast:", JSON.stringify(layer2_calculateForecast, null, 2));
      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      //let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId_SecondLayer = saveResponse.adjustment_metadata.adjustment_id;
      /* const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId_FirstLayer
      ); 
      expect(isAdjustmentIdPresent).toBeTruthy(); */
      let layer2_KpiResponse = await EditForecastUtility.getKpiResponsesForNodes(
        testData.Nodes,
        lobName,
        scenarioId,
        inputMonths,
        node_dimension,
        node_filters,
        request,
        adjustmentId_SecondLayer
      );
      //console.log("layer1_KpiResponse:", JSON.stringify(layer1_KpiResponse, null, 2));
      let layer2_baselineValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer2_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "baseline"
      )
      console.log("layer2_baselineValue:", JSON.stringify(layer2_baselineValue, null, 2));
      let layer2_actualForecastValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer2_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "forecast"
      );
      console.log("layer2_ForecastValue:", JSON.stringify(layer2_actualForecastValue, null, 2));
      let layer2_actualPreviousValue = await EditForecastUtility.captureValuesFromKpiResponses(
        layer2_KpiResponse,
        testData.Nodes,
        inputMonths,
        node_dimension,
        "previous"
      )
      console.log("layer2_PreviousValue:", JSON.stringify(layer2_actualPreviousValue, null, 2));
      // Add assertions for calcuations
      let layer2_baselineComparisonResult = await EditForecastUtility.compareTwoResponseMaps(baselineValue_default, layer1_baselineValue)
      expect(layer2_baselineComparisonResult).toBeTruthy();
      console.log("layer2_baselineComparisonResult",+layer2_baselineComparisonResult);
      let layer2_previousComparisonResult = await EditForecastUtility.compareTwoResponseMaps(layer1_actualForecastValue, layer2_actualPreviousValue)
      expect(layer2_previousComparisonResult).toBeTruthy();
      console.log("layer2_previousComparisonResult",+layer2_previousComparisonResult);
      let layer2_forecastComparisonResult = await EditForecastUtility.compareTwoResponseMaps(layer2_calculateForecast, layer2_actualForecastValue)
      expect(layer2_forecastComparisonResult).toBeTruthy();
      console.log("layer2_forecastComparisonResult",+layer2_forecastComparisonResult);
    });
  });
});