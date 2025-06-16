import { expect, test } from "../../common/fixtures/test-hook";
import { compareFilteredForecastMonthsForCurrentDemandAndKPI, compareUFMDataToCurrentDemand ,extractDriverForecastFromKpi} from "../fixtures/ufm-currentdemand-utils";
// import ufmGetKPIResponse from "../testdata/AOP-getkpiResponse.json";
// import currentDemandGetResponse from "../testdata/AOP-CurrendemandResponse.json";
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import metricsMapping from "../testdata/ufm-currentdemand-metrics-mapping.json";
import { CurrentDemandUtility } from "../../cdf-be/fixtures/current-demand-utils";
import { WorkflowUtility } from "../fixtures/workflow-utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { nodeFormulas } from "../testdata/node-formulas";
import {UfmUtility} from "../fixtures/ufm-utils"

import { CalculatenodeValidationUtils } from "../fixtures/calculatenode-validation-utils";
import demandData from "../testdata/demand-node-validation.json"

test.describe(
  "Verify the Slot 2 Sales handoff Flow",
  { tag: "@currentDemandSalesHandoff" },
  async () => {
    test.describe.configure({ timeout: 3000_000, mode: "serial" });

    test(`Compare current Demand data for slot 2`,{ tag: "@currentDemandCompare" }, async ({ request }) => {
      // You need to fetch or construct ufmGetKPIResponse and currentDemandGetResponse here
      // Example (replace with actual API calls or fixtures as needed):
      // const ufmGetKPIResponse = await fetchKPIResponse(request);
      // const currentDemandGetResponse = await fetchCurrentDemandResponse(request);

      await WorkflowUtility.stateChangePreRequisite(
        demandData.lobName,
        request
      );
      const ufmCDScenaioDetails = await WorkflowUtility.CreateAndSendToBAReview(
        demandData.lobName,
        request
      );
      console.log("ufmCDScenaioDetails", ufmCDScenaioDetails);

      await WorkflowUtility.checkAndSendForSegmentReview(demandData.baName, request);
      const currentDemandGetResponse =
        await CurrentDemandUtility.getCurrentDemandData(request, 2, "SBU");


      const scenario_details = {
        scenarioId: ufmCDScenaioDetails.scenarioId,
        scenarioVersion: ufmCDScenaioDetails.scenarioVersion,
      };
      const node_dimension = [];
      const filter = demandData.filter
      const inputNodes = Object.values(metricsMapping).map(
        (metric: any) => metric.nodevarname
      );

      const ufmGetKPIResponse = await EditForecastUtility.getKpiForecast(
        demandData.lobName,
        scenario_details,
        [],
        node_dimension,
        inputNodes,
        filter,
        request
      );
      await compareUFMDataToCurrentDemand(
        ufmGetKPIResponse,
        currentDemandGetResponse
      );
    });


test(`verify if the Demand nodes are calculated correct`,{ tag: "@DemandNodeCalcValidation" }, async ({ request }) => {
  
  const months = ["202604", "202605", "202606"]; 

  let inputnodeVarNames = Object.keys(nodeFormulas).filter(
    (key) => nodeFormulas[key] === "input"
  );
  let calcnodeVarNames = Object.keys(nodeFormulas).filter(
    (key) => nodeFormulas[key] !== "input"
  );

  let [ufmCDScenaioDetails] = await ForecastUtility.getOrCreateForecastIfNotExists(demandData.lobName, request);

  const scenario_details = {
    scenarioId: ufmCDScenaioDetails.scenarioId,
    scenarioVersion: ufmCDScenaioDetails.scenarioVersion,
  };
  const node_dimension = [];


  // --- Make a single API call for all months ---
  const [ufmGetKPIResponseInputs, ufmGetKPIResponseCalc] = await Promise.all([
    EditForecastUtility.getKpiForecast(
      demandData.lobName,
      scenario_details,
      months,
      node_dimension,
      inputnodeVarNames,
      demandData.filter,
      request
    ),
    EditForecastUtility.getKpiForecast(
      demandData.lobName,
      scenario_details,
      months,
      node_dimension,
      calcnodeVarNames,
      demandData.filter,
      request
    ),
  ]);

  // --- Build the comparison object ---
const comparisonObj: Record<string, { calculatedNodes: Record<string, number>, apiNodeValues: Record<string, number> }> = {};

for (const monthKey of months) {
  const inputValues = extractDriverForecastFromKpi(ufmGetKPIResponseInputs, monthKey);
  const calculatedNodes = CalculatenodeValidationUtils.calculateAllNodes(inputValues, nodeFormulas);
  const apiNodeValues = extractDriverForecastFromKpi(ufmGetKPIResponseCalc, monthKey);
  comparisonObj[monthKey] = { calculatedNodes, apiNodeValues };
}

// --- Compare all months and nodes at once ---

  await UfmUtility.compareNodeValuesByMonth(comparisonObj, 0.5);
  console.log("All nodes matched for all months!");


});

});
