import { expect } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { UfmUtility } from "./ufm-utils";

export class ScenarioUtils {
  static async getScenariosWithStatus(request, statusCodes: number[], parent_name) {
    const dimvalId = await UfmUtility.getMappingValue(
      { parent_name: parent_name },
      "parent_id"
    );
    const dimId = await UfmUtility.getMappingValue(
      { parent_name: parent_name },
      "parent_dim_id"
    );
    const apiPayload = {
      unit: "Millions",
      dim_id: dimId,
      dim_val_id: dimvalId,
      classification_id: commonData.classification_id,
      template_id: 1,
      filters: [],
      additional_filters: {
        template_include_headers: [
          { name: "vs LY", format: "percent" },
          { name: "vs Plan", format: "absolute" },
        ],
      },
    };
    const endpointURL = `${process.env.apiBaseURLUFM}/reports/get-report`;
    const response = await request.post(endpointURL, { data: apiPayload });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    return data.rowData.filter((row: any) =>
      statusCodes.includes(row.forecastStatus.statusCode)
    );
  }

  static async pollScenariosStatus(
    request,
    retry,
    interval,
    scenario,
    statusCodes: number[],
    parent_name: string
  ) {
    let isProcessComplete = false;
    let exec = 0;
    while (exec < retry && !isProcessComplete) {
      const scenarios = await ScenarioUtils.getScenariosWithStatus(
        request,
        statusCodes,
        parent_name
      );
      const targetScenarioStatus = scenarios.find(
        (s) => s.scenarioId === scenario.scenarioId
      );

      if (
        targetScenarioStatus &&
        statusCodes.includes(targetScenarioStatus.forecastStatus.statusCode)
      ) {
        isProcessComplete = true;
      } else {
        exec++;
        await new Promise((resolve) => setTimeout(resolve, interval));
        interval += interval;
      }
    }
    return isProcessComplete;
  }
}
