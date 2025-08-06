import { expect, test } from "../../../common/fixtures/test-hook";
import { ScenarioUtils } from "../../fixtures/copy-scenairo-utils";
import aopEdits from "../../testdata/aop-edits.json";
import adjustmentData from "../../testdata/adjustment.json";
import { Utility } from "../../../common/fixtures/utils";
import { UfmUtility } from "../../fixtures/ufm-utils";
import commonData from "../../constants/common.json";
import copyTestData from "./copy-scenario-testdata.json"

test.describe("Copy Scenario API E2E", () => {
  test(
    "Find scenarios with forecast status Draft and trigger copy",
    { tag: "@Regression @Smoke @CopyScenario @Visualization @ibg-ufm-core-service @ibg-ufm-domino-service @ibg-ufm-allocation-engine @@ibg-ufm-reporting-proxy" },
    async ({ request }) => {
      let sourceScenario, targetScenario;
      const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
      const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
      let adjustment_payload = aopEdits.input_driver_allocation_payload;
      const copyData = copyTestData["copy-scenario"]

      const lobName = copyData.lobName;
      const BAName = lobName;
      const lobDimId = await UfmUtility.getMappingValue(
        { parent_name: BAName },
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
      const inputNodeList = copyData.inputNodes;
      const editableStatus = [commonData.Draft, commonData.Change_Requested];
      let preEditData;
      await test.step("Fetch scenarios with forecast status Draft or Change Requested", async () => {
        const scenarios = await ScenarioUtils.getScenariosWithStatus(
          request,
          editableStatus,
          lobName
        );
        expect(scenarios.length).toBeGreaterThan(1);
        sourceScenario = scenarios[0];
        targetScenario = scenarios[1];
      });

      await test.step("Fetch and store non edited data for target scenario", async () => {
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

      await test.step("Edit and save data in source scenario", async () => {
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
            edit.data = { [editedMonth]: copyData.defaultInputValue };
          }
        });

        const response = await request.patch(adjustmentEndpointURL, {
          data: adjustment_payload,
        });
        let responseBody = await Utility.assertAndLog(response);
        expect(responseBody.message).toBe(aopEdits.adjustment_success);
      });

      await test.step("Trigger copy scenario API", async () => {
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

      await test.step("Poll target scenario status until copy completes or max attempts reached", async () => {
        let isProcessComplete = await ScenarioUtils.pollScenariosStatus(
          request,
          10, // retry attempts
          5000, // interval in milliseconds;
          targetScenario,
          editableStatus,
          lobName
        );
        expect(isProcessComplete).toBeTruthy();
      });

      await test.step("Verify adjustment entry for copy scenario", async () => {
        const adjustmentEndpoint = `${process.env.apiBaseURLUFM}/adjustment/?scenario_id=${targetScenario.scenarioId}&scenario_version_timestamp=${targetScenario.scenarioVersion}`;
        const adjResp = await request.get(adjustmentEndpoint);
        expect(adjResp.ok()).toBeTruthy();
        const adjData = await adjResp.json();
        const expectedName = `Copy from source scenario: ${sourceScenario.name} (${sourceScenario.scenarioId})`;
        const found = adjData.some(
          (adj: any) => adj.adjustment_name === expectedName
        );
        expect(found).toBeTruthy();
      });

      await test.step("Validate Edited data in target Scenario", async () => {
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
          // Assertion for editedMonth
          expect(row[monthKey]).toBeTruthy();
          expect(Math.round(row[monthKey].forecast)).toBe(
            copyData.defaultInputValue
          );

          // Assertion for nonEditedMonth: should match preEditData
          const preRow = preEditData.find((r: any) => r.driver === nodeVarName);
          expect(preRow).toBeTruthy();
          expect(row[nonEditedMonthKey]).toBeTruthy();
          expect(preRow[nonEditedMonthKey]).toBeTruthy();
          expect(row[nonEditedMonthKey].forecast).toBe(
            preRow[nonEditedMonthKey].forecast
          );
        });
      });
    }
  );
});
