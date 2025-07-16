import { expect, test } from "../../../common/fixtures/test-hook";
import { ScenarioUtils } from "../../fixtures/copy-scenairo-utils";
import aopEdits from "../../testdata/aop-edits.json";
import adjustmentData from "../../testdata/adjustment.json";
import { Utility } from "../../../common/fixtures/utils";
import { UfmUtility } from "../../fixtures/ufm-utils";
import commonData from "../../constants/common.json";

test.describe("Copy scenarios in sequence", () => {
  test(
    "Find scenarios with forecast status Draft and trigger copy",
    { tag: "@Regression @Smoke @CopyScenario @Visualization" },
    async ({ request }) => {
      let sourceScenario, targetScenario, nextTargetScenario, nextToNextTargetScenario;
      const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
      const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
      let adjustment_payload = aopEdits.input_driver_allocation_payload;
      const lobDimId = await UfmUtility.getMappingValue(
        { parent_name: "ECOMMERCE" },
        "child_dim_id"
      );

      const currentTime = new Date();
      currentTime.setFullYear(currentTime.getFullYear() + 1);
      currentTime.setMonth(currentTime.getMonth() + 1);
      const editedMonth = `${currentTime.getFullYear()}${String(
        currentTime.getMonth() + 1
      ).padStart(2, "0")}`;
      const nonEditedMonth = `${currentTime.getFullYear()}${String(
        currentTime.getMonth() + 2
      ).padStart(2, "0")}`;
      const inputNodeList = commonData.ecommerceInputNodes;
      const editableStatus = [commonData.Draft, commonData.Change_Requested];
      let preEditData;
      await test.step("Fetch scenarios with forecast status Draft or Change Requested", async () => {
        const scenarios = await ScenarioUtils.getScenariosWithStatus(
          request,
          editableStatus,
          "ECOMMERCE"
        );

        sourceScenario = scenarios[0];
        targetScenario = scenarios[1];
        nextTargetScenario = scenarios[2];
        nextToNextTargetScenario = scenarios[3];

        console.log("sourceScenario :", sourceScenario);
        console.log("targetScenario :", targetScenario);
        console.log("nextTargetScenario :", nextTargetScenario);
        console.log("nextToNextTargetScenario :", nextToNextTargetScenario);

      });

      // start to copy for S1 to T1

      await test.step("Fetch and store non edited data for target scenario (T1)", async () => {
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = targetScenario.scenarioId;
        kpiPayload.scenario_version = targetScenario.scenarioVersion;
        kpiPayload.dim_id = lobDimId;
        kpiPayload.classification_id = commonData.classification_id;
        kpiPayload.dim_val_id = targetScenario.lineOfBusiness;
        kpiPayload.filters = [];
        kpiPayload.additional_filters.nodes = inputNodeList;
        kpiPayload.additional_filters.month = [editedMonth, nonEditedMonth];
        let kpiResponse = await request.post(kpiEndpointURL, {
          data: kpiPayload,
        });
        let kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        const { columnDefs, rowData } = kpiResponseBody;
        expect(columnDefs).toBeTruthy();
        expect(rowData).toBeTruthy();
        expect(rowData.length).toBeGreaterThan(0);
        preEditData = rowData;
      });

      await test.step("Edit and save data in source scenario (S1)", async () => {
        adjustment_payload.adjustment_metadata.scenario_id =
          sourceScenario.scenarioId;
        adjustment_payload.adjustment_metadata.scenario_version_timestamp =
          sourceScenario.scenarioVersion;
        adjustment_payload.allocation_request.scenario_id =
          sourceScenario.scenarioId;
        adjustment_payload.allocation_request.dim_val_id =
          sourceScenario.lineOfBusiness;
        adjustment_payload.dim_val_id = sourceScenario.lineOfBusiness;
        adjustment_payload.adjustment_metadata.adjustment_name =
          "auto copy scenario source edit";
        adjustment_payload.allocation_request.dim_id = lobDimId;
        adjustment_payload.allocation_request.edits.forEach((edit, idx) => {
          if (inputNodeList[idx]) {
            edit.node_var_name = inputNodeList[idx];
          }
          if (edit.data && editedMonth) {
            edit.data = { [editedMonth]: commonData.defaultInputValue };
          }
        });

        const response = await request.patch(adjustmentEndpointURL, {
          data: adjustment_payload,
        });
        let responseBody = await Utility.assertAndLog(response);
        expect(responseBody.message).toBe(aopEdits.adjustment_success);
        await new Promise(resolve => setTimeout(resolve, 15000));
      });

      await test.step("Trigger copy scenario API to copy data from S1 to T1", async () => {
        const copyPayload = {
          dim_val_id: sourceScenario.lineOfBusiness,
          dim_id: lobDimId,
          source_scenario: {
            scenario_id: sourceScenario.scenarioId.toString(),
            scenario_version: sourceScenario.scenarioVersion.toString(),
            type: "scenarios",
            actual_scenario_id: sourceScenario.ATS.toString(),
            forecast_scenario_id: sourceScenario.FTS.toString(),
          },
          target_scenario: [
            {
              scenario_id: targetScenario.scenarioId.toString(),
              scenario_version: targetScenario.scenarioVersion.toString(),
              type: "scenarios",
              actual_scenario_id: targetScenario.ATS.toString(),
              forecast_scenario_id: targetScenario.FTS.toString(),
            },
          ],
          additional_filters: {
            period_view: ["month"],
            nodes: inputNodeList,
            month: [editedMonth],
          },
        };

        const copyEndpoint = `${process.env.apiBaseUTILITYSERVICE}/v1/copy-scenario/`;
        const response = await request.post(copyEndpoint, {
          data: copyPayload,
        });
        expect(response.ok()).toBeTruthy();
        const respBody = await response.json();
        expect(respBody).toHaveProperty(
          "message",
          "Copy scenario is in progress."
        );
      });

      await test.step("Poll target scenario T1 status until copy completes or max attempts reached", async () => {
        let isProcessComplete = await ScenarioUtils.pollScenariosStatus(
          request,
          10, // retry attempts
          5000, // interval in milliseconds;
          targetScenario,
          editableStatus,
          "ECOMMERCE"
        );
        expect(isProcessComplete).toBeTruthy();
      });

      await test.step("Verify adjustment entry for the copied scenario T1", async () => {
        const adjustmentEndpoint = `${process.env.apiBaseURLUFM}/adjustment/?scenario_id=${targetScenario.scenarioId}&scenario_version_timestamp=${targetScenario.scenarioVersion}`;
        const adjResp = await request.get(adjustmentEndpoint);

        expect(adjResp.ok()).toBeTruthy();
        const adjData = await adjResp.json();
        const expectedName = `Copy from source scenario: ${sourceScenario.scenarioId}`;
        const found = adjData.some(
          (adj: any) => adj.adjustment_name === expectedName
        );
        expect(found).toBeTruthy();
      });

      await test.step("Validate Edited data in target Scenario T1", async () => {
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = targetScenario.scenarioId;
        kpiPayload.scenario_version = targetScenario.scenarioVersion;
        kpiPayload.dim_id = lobDimId;
        kpiPayload.classification_id = commonData.classification_id;
        kpiPayload.dim_val_id = targetScenario.lineOfBusiness;
        kpiPayload.filters = [];
        kpiPayload.additional_filters.nodes = inputNodeList;
        kpiPayload.additional_filters.month = [editedMonth, nonEditedMonth];
        let kpiResponse = await request.post(kpiEndpointURL, {
          data: kpiPayload,
        });
        let kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        const { columnDefs, rowData } = kpiResponseBody;
        const monthKey = editedMonth;
        const nonEditedMonthKey = nonEditedMonth;
        expect(columnDefs).toBeTruthy();
        expect(rowData).toBeTruthy();
        expect(rowData.length).toBeGreaterThan(0);

        inputNodeList.forEach((nodeVarName) => {
          const row = rowData.find((r: any) => r.driver === nodeVarName);
          expect(row).toBeTruthy();
          expect(row[monthKey]).toBeTruthy();

          expect(Math.round(row[monthKey].forecast)).toBe(
            Math.round(commonData.defaultInputValue)
          );

          // Assertion for nonEditedMonth: should match preEditData
          const preRow = preEditData.find((r: any) => r.driver === nodeVarName);
          expect(preRow).toBeTruthy();
          expect(row[nonEditedMonthKey]).toBeTruthy();
          expect(preRow[nonEditedMonthKey]).toBeTruthy();
          expect(Math.round(row[nonEditedMonthKey].forecast)).toBe(
            Math.round(preRow[nonEditedMonthKey].forecast)
          );
        });
      });



      // start to copy from T1 to T2

      await test.step("Fetch and store non edited data for target scenario (T2)", async () => {
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = nextTargetScenario.scenarioId;
        kpiPayload.scenario_version = nextTargetScenario.scenarioVersion;
        kpiPayload.dim_id = lobDimId;
        kpiPayload.classification_id = commonData.classification_id;
        kpiPayload.dim_val_id = nextTargetScenario.lineOfBusiness;
        kpiPayload.filters = [];
        kpiPayload.additional_filters.nodes = inputNodeList;
        kpiPayload.additional_filters.month = [editedMonth, nonEditedMonth];
        let kpiResponse = await request.post(kpiEndpointURL, {
          data: kpiPayload,
        });
        let kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        const { columnDefs, rowData } = kpiResponseBody;
        expect(columnDefs).toBeTruthy();
        expect(rowData).toBeTruthy();
        expect(rowData.length).toBeGreaterThan(0);
        preEditData = rowData;
      });


      await test.step("Trigger copy scenario API to copy data from T1 to T2", async () => {
        const copyPayload = {
          dim_val_id: targetScenario.lineOfBusiness,
          dim_id: lobDimId,
          source_scenario: {
            scenario_id: targetScenario.scenarioId.toString(),
            scenario_version: targetScenario.scenarioVersion.toString(),
            type: "scenarios",
            actual_scenario_id: targetScenario.ATS.toString(),
            forecast_scenario_id: targetScenario.FTS.toString(),
          },
          target_scenario: [
            {
              scenario_id: nextTargetScenario.scenarioId.toString(),
              scenario_version: nextTargetScenario.scenarioVersion.toString(),
              type: "scenarios",
              actual_scenario_id: nextTargetScenario.ATS.toString(),
              forecast_scenario_id: nextTargetScenario.FTS.toString(),
            },
          ],
          additional_filters: {
            period_view: ["month"],
            nodes: inputNodeList,
            month: [editedMonth],
          },
        };
        const copyEndpoint = `${process.env.apiBaseUTILITYSERVICE}/v1/copy-scenario/`;
        const response = await request.post(copyEndpoint, {
          data: copyPayload,
        });
        expect(response.ok()).toBeTruthy();
        const respBody = await response.json();
        expect(respBody).toHaveProperty(
          "message",
          "Copy scenario is in progress."
        );
      });

      await test.step("Poll target scenario T2 status until copy completes or max attempts reached", async () => {
        let isProcessComplete = await ScenarioUtils.pollScenariosStatus(
          request,
          5, // retry attempts
          5000, // interval in milliseconds;
          nextTargetScenario,
          editableStatus,
          "ECOMMERCE" 
        );
        expect(isProcessComplete).toBeTruthy();
      });

      await test.step("Verify adjustment entry for the copied scenario T2", async () => {
        const adjustmentEndpoint = `${process.env.apiBaseURLUFM}/adjustment/?scenario_id=${nextTargetScenario.scenarioId}&scenario_version_timestamp=${nextTargetScenario.scenarioVersion}`;
        const adjResp = await request.get(adjustmentEndpoint);
        const adjData = await adjResp.json();
        const expectedName = `Copy from source scenario: ${targetScenario.scenarioId}`;
        const found = adjData.some(
          (adj: any) => adj.adjustment_name === expectedName
        );
        expect(found).toBeTruthy();
      });

      await test.step("Validate Edited data in target Scenario T2", async () => {
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = nextTargetScenario.scenarioId;
        kpiPayload.scenario_version = nextTargetScenario.scenarioVersion;
        kpiPayload.dim_id = lobDimId;
        kpiPayload.classification_id = commonData.classification_id;
        kpiPayload.dim_val_id = nextTargetScenario.lineOfBusiness;
        kpiPayload.filters = [];
        kpiPayload.additional_filters.nodes = inputNodeList;
        kpiPayload.additional_filters.month = [editedMonth, nonEditedMonth];
        let kpiResponse = await request.post(kpiEndpointURL, {
          data: kpiPayload,
        });
        let kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        const { columnDefs, rowData } = kpiResponseBody;
        const monthKey = editedMonth;
        const nonEditedMonthKey = nonEditedMonth;
        expect(columnDefs).toBeTruthy();
        expect(rowData).toBeTruthy();
        expect(rowData.length).toBeGreaterThan(0);

        inputNodeList.forEach((nodeVarName) => {
          const row = rowData.find((r: any) => r.driver === nodeVarName);
          expect(row).toBeTruthy();
          expect(row[monthKey]).toBeTruthy();
          
          expect(Math.round(row[monthKey].forecast)).toBe(
            Math.round(commonData.defaultInputValue)
          );

          // Assertion for nonEditedMonth: should match preEditData
          const preRow = preEditData.find((r: any) => r.driver === nodeVarName);
          expect(preRow).toBeTruthy();
          expect(row[nonEditedMonthKey]).toBeTruthy();
          expect(preRow[nonEditedMonthKey]).toBeTruthy();
          expect(Math.round(row[nonEditedMonthKey].forecast)).toBe(
            Math.round(preRow[nonEditedMonthKey].forecast)
          );
        });
      });


      // start to copy for T2 to T3

      await test.step("Fetch and store non edited data for target scenario (T3)", async () => {
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = nextToNextTargetScenario.scenarioId;
        kpiPayload.scenario_version = nextToNextTargetScenario.scenarioVersion;
        kpiPayload.dim_id = lobDimId;
        kpiPayload.classification_id = commonData.classification_id;
        kpiPayload.dim_val_id = nextToNextTargetScenario.lineOfBusiness;
        kpiPayload.filters = [];
        kpiPayload.additional_filters.nodes = inputNodeList;
        kpiPayload.additional_filters.month = [editedMonth, nonEditedMonth];
        let kpiResponse = await request.post(kpiEndpointURL, {
          data: kpiPayload,
        });
        let kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        const { columnDefs, rowData } = kpiResponseBody;
        expect(columnDefs).toBeTruthy();
        expect(rowData).toBeTruthy();
        expect(rowData.length).toBeGreaterThan(0);
        preEditData = rowData;
      });

      await test.step("Trigger copy scenario API to copy data from T2 to T3", async () => {
        const copyPayload = {
          dim_val_id: nextTargetScenario.lineOfBusiness,
          dim_id: lobDimId,
          source_scenario: {
            scenario_id: nextTargetScenario.scenarioId.toString(),
            scenario_version: nextTargetScenario.scenarioVersion.toString(),
            type: "scenarios",
            actual_scenario_id: nextTargetScenario.ATS.toString(),
            forecast_scenario_id: nextTargetScenario.FTS.toString(),
          },
          target_scenario: [
            {
              scenario_id: nextToNextTargetScenario.scenarioId.toString(),
              scenario_version: nextToNextTargetScenario.scenarioVersion.toString(),
              type: "scenarios",
              actual_scenario_id: nextToNextTargetScenario.ATS.toString(),
              forecast_scenario_id: nextToNextTargetScenario.FTS.toString(),
            },
          ],
          additional_filters: {
            period_view: ["month"],
            nodes: inputNodeList,
            month: [editedMonth],
          },
        };
        const copyEndpoint = `${process.env.apiBaseUTILITYSERVICE}/v1/copy-scenario/`;
        const response = await request.post(copyEndpoint, {
          data: copyPayload,
        });
        expect(response.ok()).toBeTruthy();
        const respBody = await response.json();
        expect(respBody).toHaveProperty(
          "message",
          "Copy scenario is in progress."
        );
      });

      await test.step("Poll target scenario T3 status until copy completes or max attempts reached", async () => {
        let isProcessComplete = await ScenarioUtils.pollScenariosStatus(
          request,
          10, // retry attempts
          5000, // interval in milliseconds;
          nextToNextTargetScenario,
          editableStatus,
          "ECOMMERCE"
        );
        expect(isProcessComplete).toBeTruthy();
      });

      await test.step("Verify adjustment entry for the copied scenario T3", async () => {
        const adjustmentEndpoint = `${process.env.apiBaseURLUFM}/adjustment/?scenario_id=${nextToNextTargetScenario.scenarioId}&scenario_version_timestamp=${nextToNextTargetScenario.scenarioVersion}`;
        const adjResp = await request.get(adjustmentEndpoint);
        const adjData = await adjResp.json();
        const expectedName = `Copy from source scenario: ${targetScenario.scenarioId}`;
        const found = adjData.some(
          (adj: any) => adj.adjustment_name === expectedName
        );
        expect(found).toBeTruthy();
      });

      await test.step("Validate Edited data in target Scenario T3", async () => {
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = nextToNextTargetScenario.scenarioId;
        kpiPayload.scenario_version = nextToNextTargetScenario.scenarioVersion;
        kpiPayload.dim_id = lobDimId;
        kpiPayload.classification_id = commonData.classification_id;
        kpiPayload.dim_val_id = nextToNextTargetScenario.lineOfBusiness;
        kpiPayload.filters = [];
        kpiPayload.additional_filters.nodes = inputNodeList;
        kpiPayload.additional_filters.month = [editedMonth, nonEditedMonth];
        let kpiResponse = await request.post(kpiEndpointURL, {
          data: kpiPayload,
        });
        let kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        const { columnDefs, rowData } = kpiResponseBody;
        const monthKey = editedMonth;
        const nonEditedMonthKey = nonEditedMonth;
        expect(columnDefs).toBeTruthy();
        expect(rowData).toBeTruthy();
        expect(rowData.length).toBeGreaterThan(0);

        inputNodeList.forEach((nodeVarName) => {
          const row = rowData.find((r: any) => r.driver === nodeVarName);
          expect(row).toBeTruthy();
          // Assertion for editedMonth
          expect(row[monthKey]).toBeTruthy();
          expect(Math.round(row[monthKey].forecast)).toBe(
            commonData.defaultInputValue
          );

          // Assertion for nonEditedMonth: should match preEditData
          const preRow = preEditData.find((r: any) => r.driver === nodeVarName);
          expect(preRow).toBeTruthy();
          expect(row[nonEditedMonthKey]).toBeTruthy();
          expect(preRow[nonEditedMonthKey]).toBeTruthy();
          expect(Math.round(row[nonEditedMonthKey].forecast)).toBe(
            Math.round(preRow[nonEditedMonthKey].forecast)
          );
        });
      });

    }
  );
});
