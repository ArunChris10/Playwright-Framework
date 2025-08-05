import { fail } from "assert";
import { test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import commonData from "../../constants/common.json";
import orgList from "../../constants/PBA_SBA_List.json";
import { ForecastUtility } from "../../fixtures/forecast-utils";
import { UfmUtility } from "../../fixtures/ufm-utils";
import getKpiData from "../../testdata/getKpi.json";

// const lobList = orgList.SBAList;
const lobList = [
  "INSTORE AND OTHER",
  "SCHEDULED",
  "UNSCHEDULED AND CORE",
];

lobList.forEach((lobName) => {
  let responseBody, scenario_details;
  let isNewCreated = false;

  test.describe(
    `Verify if data is present for all input nodes for ${lobName} lobName`,
    { tag: "@Smoke @Regression @dataCheck @ibg-ufm-domino-service @ibg-ufm-metadata-service @ibg-ufm-core-service @ibg-ufm-allocation-engine" },
    () => {
      test.describe.configure({ timeout: 600_000, mode: "parallel" });

      test(`Verify input nodes data for ${lobName} scenario`, async ({
        request,
      }) => {
        let monthYear = (parseInt(await Utility.getMonthYear()) - 1).toString();
        let input_nodes = new Map();

        await test.step(`Get Scenario details for ${lobName} forecast if present or create new`, async () => {
          if (
            (await ForecastUtility.countOfScenario(
              lobName,
              process.env.ufmUser,
              request
            )) >= commonData.MAX_SCENARIO_COUNT
          ) {
            await ForecastUtility.deleteAllforecastofUser(
              request,
              lobName,
              process.env.ufmUser
            );
          }
          //Getting forecast details
          [scenario_details, isNewCreated] =
            await ForecastUtility.getOrCreateForecastIfNotExists(
              lobName,
              request
            );
        });

        await test.step(`Call get kpi and get result for ${lobName} lobName`, async () => {
          const inputNodes = await UfmUtility.getDriverList(
            lobName,
            "Input",
            request
          );

          input_nodes = new Map(
            inputNodes.map((node) => [node.node_name, node.node_var_name])
          );

          const nodes = Array.from(input_nodes.values());

          const endpointURL = `${process.env.apiBaseURLUFM}${getKpiData.endpoint}`;
          getKpiData.payloads.scenario_id = scenario_details["scenarioId"];
          getKpiData.payloads.scenario_version =
            scenario_details["scenarioVersion"];
          getKpiData.payloads.dim_val_id = await UfmUtility.getMapping(
            lobName,
            "dim_val_id"
          );
          getKpiData.payloads.additional_filters.nodes = nodes;
          getKpiData.payloads.additional_filters.template_include_headers[1].name =
            monthYear;
          getKpiData.payloads.additional_filters.month = [monthYear];

          Utility.logIt(getKpiData.payloads);
          const response = await request.post(endpointURL, {
            data: getKpiData.payloads,
          });
          responseBody = await response.json();
        });

        await test.step(`Get list of input nodes having Empty cell for ${lobName} lobName`, async () => {
          let monthAlias;
          responseBody.rowData.forEach((item) => {
            monthAlias = item[monthYear].month_alias;
            input_nodes.delete(item.nodeName);
          });
          if (input_nodes.size > 0) {
            Utility.logIt(
              `These input nodes have empty cell for month ${monthYear} - ` +
              Array.from(input_nodes.keys())
            );
            fail(
              `These input nodes have empty cell for month ${monthYear} - ` +
              Array.from(input_nodes.keys())
            );
          }
        });

        await test.step(`Teardown Deleting forecast for "${lobName}`, async () => {
          if (isNewCreated)
            await ForecastUtility.deleteForecast(
              scenario_details["scenarioId"],
              scenario_details["scenarioVersion"],
              commonData.ba_dim_id,
              await UfmUtility.getMapping(lobName, "dim_val_id"),
              request
            );
        });
      });
    }
  );
});
