import { expect, test } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { testData } from "../testdata/editForecast.json";
import adjustmentData from "../testdata/adjustment.json";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import { Utility } from "../../common/fixtures/utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
export interface NodeDimension { };
export interface filters { };

Object.entries(testData).forEach(([lobName, testData]) => {

  let scenarioId;
  let scenarioVersion;
  let allocationMethod;
  let inputNodesType;
  let node_dimension: NodeDimension = {};
  let node_filters: filters = {};

  test.describe("Verify Calculate & Save API", { tag: "@Smoke @Regression @adjustment @mytest" }, () => {

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
      const [scenario_details] = await ForecastUtility.getOrCreateForecastIfNotExists(
        testData.lobName,
        request
      );

      scenarioId = scenario_details["scenarioId"];
      scenarioVersion = scenario_details["scenarioVersion"];
    }); 

    test.describe.configure({ timeout: 500_000, mode: "parallel" });

    test(`Verify calculate when allocation method with maintain ratio is applied on non-additive node for LoB - ${lobName}`,{ tag: "@pallavi"} ,async ({
      request,
    }) => {
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["NonAdditive"], node_dimension, node_filters, request);
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
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["Additive"], node_dimension,node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);
      //Adding Assertions
      await EditForecastUtility.validateForecastResponse(responseBody, obj, baselineValuesMap, months);
    }); 

    test(`Verify calculate & Save additive & non additive nodes are in same payload for LoB - ${lobName}`, async ({
      request,
    }) => {
      inputNodesType = ["NonAdditive", "Additive"];
      allocationMethod = commonData["Maintain Ratio"];
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension,node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);
      //Adding Assertions for calculate
      await EditForecastUtility.validateForecastResponse(responseBody, obj, baselineValuesMap, months);
      // Save & Validate the Adjustment
      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, inputNodesType, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId = saveResponse.adjustment_metadata.adjustment_id;
      const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId
      );
      expect(isAdjustmentIdPresent).toBeTruthy();
    }); 

    test(`Verify Calculate & Save when node is at lower grain for LoB - ${lobName}`, async ({ request,
    }) => {
      node_dimension = testData.node_dimension;
      allocationMethod = commonData["Maintain Ratio"];
      inputNodesType = ["Additive", "NonAdditive"];
      console.log("Test1");
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension,node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);
      // Adding assertion for node_dimension
      const expectedNodeDimension = testData.node_dimension;
      responseBody.forEach((node: any) => {
        expect(node.department).toEqual(expectedNodeDimension.department);
      });

      // Save & Validate the Adjustment

      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, inputNodesType, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId = saveResponse.adjustment_metadata.adjustment_id;
      const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId
      );
      expect(isAdjustmentIdPresent).toBeTruthy();
    });

    test(`Verify calculate & Save for combination of type of nodes - %,$,# for LoB - ${lobName}`, async ({
      request,
    }) => {
      inputNodesType = ["NonAdditive", "Additive"];
      allocationMethod = commonData["Maintain Ratio"];
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension,node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);

      // Save & Validate the Adjustment
      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, inputNodesType, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId = saveResponse.adjustment_metadata.adjustment_id;
      const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId
      );
      expect(isAdjustmentIdPresent).toBeTruthy();
    }); 

    test(`Verify Calculate & Save, when any filter combination is applied on non-additive node with maintain ratio for LoB - ${lobName}`,{tag:"@Filterdata"}, async ({ request,
    }) => {
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["NonAdditive"], node_dimension, testData.filters, request);
      
      console.log(" allocatedata Payload object:", JSON.stringify(obj, null, 2));
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);
      
      // Save & Validate the Adjustment

      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, inputNodesType, node_dimension, obj, request);

      await expect.soft(saveResponse.message).toEqual(adjustmentData.successMessage);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_name).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
      await expect.soft(saveResponse.adjustment_metadata.adjustment_reason).toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

      let getAllAdjustmentsCountAfter = await AdjustmentUtility.getAllAdjustments(scenarioId, scenarioVersion, testData.lobName, request);
      const adjustmentId = saveResponse.adjustment_metadata.adjustment_id;
      const isAdjustmentIdPresent = getAllAdjustmentsCountAfter.some(
        (adjustment: any) => adjustment.adjustment_id === adjustmentId
      );
      expect(isAdjustmentIdPresent).toBeTruthy();
    });

    test(`Verify Calculate when any filter combination is applied on additive node with maintain ratio for LoB - ${lobName}`,{tag:"@Filterdata2"}, async ({ request,
    }) => {

      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["Additive"], node_dimension, testData.filters, request);
      
      console.log(" allocatedata Payload object:", JSON.stringify(obj, null, 2));
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);
      //Adding Assertions
      await EditForecastUtility.validateForecastResponse(responseBody, obj, baselineValuesMap, months);
    });

  });
})

