import { expect, test } from "../../common/fixtures/test-hook";
import { compareUFMDataToCurrentDemand } from "../fixtures/ufm-currentdemand-utils";
// import ufmGetKPIResponse from "../testdata/AOP-getkpiResponse.json";
// import currentDemandGetResponse from "../testdata/AOP-CurrendemandResponse.json";
import { EditForecastUtility } from "../fixtures/editForecast-utils";
import metricsMapping from "../testdata/ufm-currentdemand-metrics-mapping.json";
import { CurrentDemandUtility } from "../../cdf-be/fixtures/current-demand-utils";
import { WorkflowUtility } from "../fixtures/workflow-utils";

test.describe(
  "Compare current Demand data",
  { tag: "@currentDemandCompare" },
  async () => {
    test.describe.configure({ timeout: 3000_000, mode: "serial" });

    test(`Compare current Demand data`, async ({ request }) => {
      // You need to fetch or construct ufmGetKPIResponse and currentDemandGetResponse here
      // Example (replace with actual API calls or fixtures as needed):
      // const ufmGetKPIResponse = await fetchKPIResponse(request);
      // const currentDemandGetResponse = await fetchCurrentDemandResponse(request);

      await WorkflowUtility.stateChangePreRequisite(
        "CONSOLIDATED DEMAND",
        request
      );
      const ufmCDScenaioDetails = await WorkflowUtility.CreateAndSendToBAReview(
        "CONSOLIDATED DEMAND",
        request
      );
      console.log("ufmCDScenaioDetails", ufmCDScenaioDetails);

      await WorkflowUtility.checkAndSendForSegmentReview("DEMAND", request);
      const currentDemandGetResponse =
        await CurrentDemandUtility.getCurrentDemandData(request, 2, "SBU");

      const lobName = "CONSOLIDATED DEMAND";
      const scenario_details = {
        scenarioId: ufmCDScenaioDetails.scenarioId,
        scenarioVersion: ufmCDScenaioDetails.scenarioVersion,
      };
      const node_dimension = [];
      const filter = [
        {
          dim_id: 2,
          dim_val_ids: [20002, 20004, 20010, 20011, 20012, 20013],
          children: [],
        },
      ];
      const inputNodes = Object.values(metricsMapping).map(
        (metric: any) => metric.nodevarname
      );

      const ufmGetKPIResponse = await EditForecastUtility.getKpiForecast(
        lobName,
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
  }
);
