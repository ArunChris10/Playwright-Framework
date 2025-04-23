import { expect, test } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { testData } from "../testdata/editForecast.json";
import adjustmentData from "../testdata/adjustment.json";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import { Utility } from "../../common/fixtures/utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
export interface NodeDimension { };
export interface filters extends Array<any> { };

Object.entries(testData).forEach(([lobName, testData]) => {

  let scenarioId;
  let scenarioVersion;
  let allocationMethod;
  let inputNodesType;
  let node_dimension: NodeDimension = {};
  let node_filters: filters = [];

  test.describe("Verify Calculate & Save API", { tag: "@Smoke @Regression @adjustment" }, () => {

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

    test(`Verify calculate & Save when allocation method with maintain ratio is applied on non-additive node for LoB - ${lobName}`, async ({
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

    test(`Verify calculate & Save when allocation method with maintain ratio is applied on additive node for LoB - ${lobName}`, async ({
      request,
    }) => {
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, commonData["Maintain Ratio"], ["Additive"], node_dimension, node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      let responseBody = await Utility.assertAndLog(response);
      //Adding Assertions
      await EditForecastUtility.validateForecastResponse(responseBody, obj, baselineValuesMap, months);
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

    test(`Verify calculate & Save additive & non additive nodes are in same payload for LoB - ${lobName}`, async ({
      request,
    }) => {
      inputNodesType = ["NonAdditive", "Additive"];
      allocationMethod = commonData["Maintain Ratio"];
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
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
      allocationMethod = commonData["Constant value"];
      inputNodesType = ["Additive", "NonAdditive"];
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
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
      const { obj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let response = await request.post(endpointURL, {
        data: obj,
      });
      await Utility.assertAndLog(response);

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

    test(`Verify calculate & Save for multiple edits at once for LoB - ${lobName}`, async ({
      request,
    }) => {
      inputNodesType = ["NonAdditive", "Additive"];
      allocationMethod = commonData["Maintain Ratio"];
      const { obj: firstEditObj } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
      const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
      let firstEditResponse = await request.post(endpointURL, {
        data: firstEditObj,
      });
      await Utility.assertAndLog(firstEditResponse);

      // Edit again
      Utility.logIt("Peform another edit on top of the first edit");
      const { obj: secondEditObj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
      let response = await request.post(endpointURL, {
        data: secondEditObj,
      });
      let responseBody = await Utility.assertAndLog(response);
      //Adding Assertions for calculate
      await EditForecastUtility.validateForecastResponse(responseBody, secondEditObj, baselineValuesMap, months);

      // Save & Validate the Adjustment
      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, inputNodesType, node_dimension, secondEditObj, request);

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

    test(`Verify calculate & Save when allocation method with constant value is applied on non-additive node for LoB - ${lobName}`, async ({
      request,
    }) => {
      node_dimension = testData.node_dimension;
      allocationMethod = commonData["Constant value"];
      inputNodesType = ["NonAdditive"];
      const { obj } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
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
      const ratioMap: Record<string, Record<string, number>> = {}; // To store the ratio for each node and month
      for (const responseNode of responseBody) {
        const { node_var_name, edits: responseEdits } = responseNode;
        // Validate the edits (month and forecast values) for nodes present in obj.edits
        const payloadNode = obj.edits.find(edit => edit.node_var_name === node_var_name);
        if (payloadNode) {
          ratioMap[node_var_name] = {}; // Initialize the node entry in ratioMap
          for (const [month, edit] of Object.entries(responseEdits as Record<string, { forecast: number }>)) {
        const forecastValue = edit.forecast;
        // Calculate the ratio of response value to edit value passed in the body
        const expectedValue = payloadNode.data[month]; // Adjusted for the edit multiplier in case of Lower grain
        const ratio = forecastValue / expectedValue;
        // Log the ratio for debugging purposes
        Utility.logIt(`Ratio of response value to edit value for month ${month} and node ${node_var_name}: ${ratio}`);
        // Store the ratio in the ratioMap under the respective node and month
        ratioMap[node_var_name][month] = ratio;
          }
        }
      }

      //Perform another edit to validate ratio calculation matches
      const { obj: secondEditObj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
      let response1 = await request.post(endpointURL, {
        data: secondEditObj,
      });
      let secondEditResponseBody = await Utility.assertAndLog(response1);
      // Adding assertion for node_dimension
      secondEditResponseBody.forEach((node: any) => {
        expect(node.department).toEqual(expectedNodeDimension.department);
      });

      await EditForecastUtility.validateForecastResponse(secondEditResponseBody, secondEditObj, baselineValuesMap, months, ratioMap);

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

    test(`Verify calculate & Save when allocation method with constant value is applied on additive node for LoB - ${lobName}`, async ({
      request,
    }) => {
      node_dimension = testData.node_dimension;
      allocationMethod = commonData["Constant value"];
      inputNodesType = ["Additive"];
      const { obj } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
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
      const ratioMap: Record<string, Record<string, number>> = {}; // To store the ratio for each node and month
      for (const responseNode of responseBody) {
        const { node_var_name, edits: responseEdits } = responseNode;
        // Validate the edits (month and forecast values) for nodes present in obj.edits
        const payloadNode = obj.edits.find(edit => edit.node_var_name === node_var_name);
        if (payloadNode) {
          ratioMap[node_var_name] = {}; // Initialize the node entry in ratioMap
          for (const [month, edit] of Object.entries(responseEdits as Record<string, { forecast: number }>)) {
        const forecastValue = edit.forecast;
        // Calculate the ratio of response value to edit value passed in the body
        const expectedValue = payloadNode.data[month]; // Adjusted for the edit multiplier in case of Lower grain
        const ratio = forecastValue / expectedValue;
        // Log the ratio for debugging purposes
        Utility.logIt(`Ratio of response value to edit value for month ${month} and node ${node_var_name}: ${ratio}`);
        // Store the ratio in the ratioMap under the respective node and month
        ratioMap[node_var_name][month] = ratio;
          }
        }
      }
      //Perform another edit to validate ratio calculation matches
      const { obj: secondEditObj, baselineValuesMap, months } = await EditForecastUtility.createAllocationPayload(lobName, scenarioId, allocationMethod, inputNodesType, node_dimension, node_filters, request);
      let response1 = await request.post(endpointURL, {
        data: secondEditObj,
      });
      let secondEditResponseBody = await Utility.assertAndLog(response1);
      // Adding assertion for node_dimension
      secondEditResponseBody.forEach((node: any) => {
        expect(node.department).toEqual(expectedNodeDimension.department);
      });

      await EditForecastUtility.validateForecastResponse(secondEditResponseBody, secondEditObj, baselineValuesMap, months, ratioMap);

      // Save & Validate the Adjustment

      let saveResponse = await EditForecastUtility.createAdjustment(scenarioId, scenarioVersion, lobName, allocationMethod, inputNodesType, node_dimension, secondEditObj, request);

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

    test(`Verify Calculate & Save, when any filter combination is applied on non-additive node with maintain ratio for LoB - ${lobName}`, { tag: "@Filterdata" }, async ({ request,
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

    test(`Verify Calculate when any filter combination is applied on additive node with maintain ratio for LoB - ${lobName}`, { tag: "@Filterdata2" }, async ({ request,
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

