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
  let baselineValue_default;
  let layer1_baselineValue;
  let layer1_actualForecastValue;
  let layer1_actualPreviousValue;
  let inputMonths: string[] = [];
  let allocationMethod: number = commonData["Maintain Ratio"];
  let driverList;
  let editedValue: number = 100;


  test.describe("Verify Calculate & Save API for multiple adjustments", { tag: "@Smoke @Regression @patchycellupdate @ibg-ufm-domino-service @ibg-ufm-metadata-service @ibg-ufm-core-service @ibg-ufm-allocation-engine" }, () => {

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
    });

    test.describe.configure({ timeout: 500_000, mode: "serial" });

    test(`Verify allocation method is working fine on edited blank cells - ${lobName}`, async ({
      request,
    }) => {
      inputMonths = await Utility.generateNextMonths(7);
      let baseline_KpiResponse = await EditForecastUtility.getKpiResponsesForNodes(
        testData.patchyDataNode,
        lobName,
        scenarioId,
        inputMonths,
        node_dimension,
        node_filters,
        request
      );
      let patchyDataMonth: string[] = await EditForecastUtility.getFirstMonthWithEmptyForecast(baseline_KpiResponse, testData.patchyDataNode);
      console.log("patchyDataMonth:", patchyDataMonth);
      // edit & calculate the patchy cell
      const { obj, months } = await EditForecastUtility.createAllocationPayloadForPatchyCell(lobName, scenarioId, allocationMethod, node_dimension, patchyDataMonth, node_filters, editedValue);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);

      // Validate through assertions
      let editPatchyCell_calculateForecast = await EditForecastUtility.validateForecastOnCalculate(responseBody, obj);
      console.log("calculateForecast:", JSON.stringify(editPatchyCell_calculateForecast, null, 2));
      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId_onsave = saveResponse.adjustment_metadata.adjustment_id;
      const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId_onsave
      );
      expect(isAdjustmentIdPresent).toBeTruthy();

      // group By to get lower grain nodes
      node_dimension = testData.node_dimension;
      let lowerGrain_KpiResponse = await EditForecastUtility.getKpiResponsesForNodes(
        testData.patchyDataNode,
        lobName,
        scenarioId,
        patchyDataMonth,
        node_dimension,
        node_filters,
        request,
        adjustmentId_onsave
      );
      console.log("lowerGrain_KpiResponse:", JSON.stringify(lowerGrain_KpiResponse, null, 2));
      let lowerGrain_actualForecastValue = await EditForecastUtility.getForecastValuesForLowerGrains(
        lowerGrain_KpiResponse,
        testData.patchyDataNode,
        patchyDataMonth
      );
      console.log("lowerGrain_actualForecastValue:", JSON.stringify(lowerGrain_actualForecastValue, null, 2));
      let totalOfLowerGrains = await EditForecastUtility.sumLowerGrainForecast(lowerGrain_actualForecastValue)
      expect(totalOfLowerGrains).toBeGreaterThanOrEqual(editedValue - 0.1);
      expect(totalOfLowerGrains).toBeLessThanOrEqual(editedValue + 0.1);
      console.log("totalOfLowerGrains", +totalOfLowerGrains);
    });
  });
});