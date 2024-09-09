import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerTableData from "../testdata/visualizer-table-data.json";

test.describe(
  "Verify user can Re-order columns as required",
  { tag: "@Regression @ibg-service-visualizer @VisualizerColumns" },
  () => {
    let templateId;
    let scenarioIdentification;
    let tableData;

    test.beforeAll(async ({ request }) => {
      const templates = await VisualizerUtility.getTemplate(request);
      templateId = templates.find(
        (t) => t.isMergedTemplate === true
      )?.templateId;
      expect(templateId).toBeTruthy();

      // use a forecast scenario
      const scenarios = (
        await VisualizerUtility.searchScenario(request, templateId)
      )?.scenarios;
      expect(scenarios?.length).toBeGreaterThan(0);
      scenarioIdentification = scenarios.find(
        (s) =>
          s.scenarioIdentification?.demandStackScenarioId != null ||
          s.scenarioIdentification?.forecastVersion !== "NO_VERSION"
      )?.scenarioIdentification;
      expect(scenarioIdentification).toBeTruthy();

      visualizerTableData.payload.scenarioIdentification = [
        scenarioIdentification,
      ] as any;
      visualizerTableData.payload.scenarioOrderList[0].scenarioIdentification =
        scenarioIdentification;
    });

    test("Verify user can re-order columns", async ({ request }) => {
      await test.step("Order: Scenario, Year, Metrics", async () => {
        tableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId
        );
        expect(tableData[0].data[0].scenarioDisplayName).toBeTruthy();
        expect(tableData[0].data[0].data[0].fiscalYear).toBeTruthy();
        expect(
          tableData[0].data[0].data[0].data[0].kpiIdentification
        ).toBeTruthy();
      });

      await test.step("Order: Metrics, Year, Scenario", async () => {
        visualizerTableData.payload.columns.reverse();
        tableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId
        );
        expect(tableData[0].data[0].kpiIdentification).toBeTruthy();
        expect(tableData[0].data[0].data[0].fiscalYear).toBeTruthy();
        expect(
          tableData[0].data[0].data[0].data[0].scenarioDisplayName
        ).toBeTruthy();
      });
    });
  }
);
