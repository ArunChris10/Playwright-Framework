import { expect, test } from "../../../common/fixtures/test-hook";
import { ScenarioUtils } from "../../fixtures/copy-scenairo-utils";
import aopEdits from "../../testdata/aop-edits.json";
import adjustmentData from "../../testdata/adjustment.json";
import { Utility } from "../../../common/fixtures/utils";
import { UfmUtility } from "../../fixtures/ufm-utils";
import commonData from "../../constants/common.json";

test.describe("Copy scenarios from different BAs", () => {
  test(
    "Find scenarios with forecast status Draft and trigger copy",
    { tag: "@Regression @Smoke @CopyScenario @Visualization @testNow" },
    async ({ request }) => {
      let sourceScenario, targetScenario;
      const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
      const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
      let adjustment_payload = aopEdits.input_driver_allocation_payload;
      const lobDimId = await UfmUtility.getMappingValue(
        { parent_name: "MERCHANDISING FINANCE" },
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
      const inputNodeList = commonData.merchOpsInputNodes;
      const editableStatus = [commonData.Draft, commonData.Change_Requested];
      let preEditData;

      await test.step("Fetch scenarios with forecast status Draft or Change Requested", async () => {
        
        const merchScenario = await ScenarioUtils.getScenariosWithStatus(
          request,
          editableStatus,
          "MERCHANDISING OPERATIONS"
        );
        sourceScenario = merchScenario[0];

        const merchFinanceScenario = await ScenarioUtils.getScenariosWithStatus(
          request,
          editableStatus,
          "MERCHANDISING FINANCE"
        );
        targetScenario = merchFinanceScenario[0];

        console.log("sourceScenario as MerchOps:", sourceScenario);
        console.log("targetScenario as MERCHANDISING FINANCE:", targetScenario);
      });


      await test.step("Fetch and store non edited data for target scenario (MERCHANDISING FINANCE)", async () => {
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
        console.log("after fetching ", preEditData)
      });

      await test.step("Trigger copy scenario API to copy data from MERCHANDISING OPERATIONS scenario to MERCHANDISING FINANCE scenario", async () => {
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

      await test.step("Poll target scenario (MERCHANDISING FINANCE) status until copy completes or max attempts reached", async () => {
        let isProcessComplete = await ScenarioUtils.pollScenariosStatus(
          request,
          10, 
          5000, 
          targetScenario,
          editableStatus,
          "MERCHANDISING FINANCE" 
        );
        expect(isProcessComplete).toBeTruthy();
      });


      await test.step("Validate Edited data in target Scenario (MERCHANDISING FINANCE)", async () => {
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

          const preEditRow = preEditData.find((preRow: any) => preRow.driver === nodeVarName);
          expect(preEditRow).toBeTruthy();
          expect(preEditRow[monthKey]).toBeTruthy();

          expect(Math.round(row[monthKey].forecast)).toBe(
            Math.round(preEditRow[monthKey].forecast)
          );
        });
      });

    }
  );
});
