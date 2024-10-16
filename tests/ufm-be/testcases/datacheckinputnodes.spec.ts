import { fail } from "assert";
import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import orgList from "../constants/PBA_SBA_List.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import getKpiData from "../testdata/getKpi.json";

const lobName = orgList.SBAList;

lobName.forEach((lob) => {
  test.describe(
    `Verify if data is present for all input nodes for ${lob} lob`,
    { tag: "@Smoke @Regression @dataCheck" },
    () => {
      test.describe.configure({ timeout: 600_000, mode: "parallel" });
      let responseBody, scenario_details, currentForecastList;

      test(`Verify input nodes data for ${lob} scenario`, async ({
        request,
      }) => {
        let monthYear = (parseInt(await Utility.getMonthYear()) - 1).toString();
        let input_nodes = new Map();

        await test.step(`Get Scenario details for ${lob} forecast if present or create new`, async () => {
          //Getting current list of forecast
          scenario_details =
            await ForecastUtility.getDraftorChangeRequestforecast(lob, request);

          //Creating forecast if not present
          if (scenario_details == 0 || scenario_details == undefined) {
            const scenarioId = await ForecastUtility.createForecast(
              lob,
              request
            );

            //Getting current list of forecast
            currentForecastList = await UfmUtility.getCurrentForecastList(
              lob,
              request
            );

            //Fetching scenario details for newly created forecast
            scenario_details = await UfmUtility.getScenarioDetails(
              currentForecastList,
              scenarioId
            );
          }
        });

        await test.step(`Call get kpi and get result for ${lob} lob`, async () => {
          const inputNodes = await UfmUtility.getInputNodelist(lob, request);

          input_nodes = new Map(
            inputNodes.map((node) => [node.node_name, node.node_var_name])
          );

          const nodes = Array.from(input_nodes.values());

          const endpointURL = `${process.env.apiBaseURLUFM}${getKpiData.endpoint}`;
          getKpiData.payloads.scenario_id = scenario_details["scenarioId"];
          getKpiData.payloads.scenario_version =
            scenario_details["scenarioVersion"];
          getKpiData.payloads.dim_val_id = await UfmUtility.getMapping(
            lob,
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

        await test.step(`Get list of input nodes having Empty cell for ${lob} lob`, async () => {
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
      });
    }
  );
});
