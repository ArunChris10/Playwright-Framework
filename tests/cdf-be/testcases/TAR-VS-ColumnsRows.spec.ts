import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerTableData from "../testdata/visualizer-table-data.json";
import visualizerSaveData from "../testdata/visualizer-create-view-scenarios-list.json";

test.describe(
  "User can move Hierarchies from rows to columns area and Metrics Date to rows and able to create the view successfully",
  { tag: "@Regression @ibg-service-visualizer @VisualizerColumnsRows" },
  () => {
    let templateId;
    let scenario;
    let initalColumn;
    let finalRow;
    let viewId;

    test.beforeAll(async ({ request }) => {
      const templates = await VisualizerUtility.getTemplate(request);
      templateId = templates.find(
        (t) => t.isMergedTemplate === true
      ).templateId;
      expect(templateId).toBeTruthy();

      // use a forecast scenario
      const scenarios = (
        await VisualizerUtility.searchScenario(request, templateId)
      ).scenarios;
      expect(scenarios.length).toBeGreaterThan(0);
      scenario = scenarios.find(
        (s) =>
          s.scenarioIdentification?.demandStackScenarioId != null ||
          s.scenarioIdentification?.forecastVersion !== "NO_VERSION"
      );
      expect(scenario).toBeTruthy();

      visualizerTableData.payload.scenarioIdentification = [
        scenario.scenarioIdentification,
      ] as any;
      visualizerTableData.payload.scenarioOrderList[0].scenarioIdentification =
        scenario.scenarioIdentification;
    });

    test.afterAll(async ({ request }) => {
      await VisualizerUtility.deleteView(request, viewId);
    });

    test("Move hierarchy from rows to columns and move Date Metrics to rows", async ({
      request,
    }) => {
      await test.step("Initial table", async () => {
        const initialTableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId,
          visualizerTableData.sbuExtendedPayload
        );
        initalColumn = initialTableData.map(
          (row) => row.data[0].data[0].data[0].kpiValue
        );
      });

      await test.step("Payload with different rows/columns", async () => {
        const finalTableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId,
          visualizerTableData.sbuColumnDateMetricsRowExtendedPayload
        );
        finalRow = finalTableData[0].rows[0].data[0].data.map(
          (col) => col.kpiValue
        );

        // assert rows and columns switched
        expect(initalColumn).toEqual(finalRow);
      });

      await test.step("Create the view", async () => {
        const displayLabelInList =
          scenario.scenarioIdentification.forecastVersion +
          "_" +
          scenario.scenarioIdentification.activeStartDate;
        const id =
          "***" +
          scenario.scenarioIdentification.forecastVersion +
          "***" +
          scenario.scenarioIdentification.activeStartDate;
        const scenarioObject = {
          label: scenario.scenarioDisplayName,
          value: scenario.scenarioDisplayName,
          displayLabelInList: displayLabelInList,
          scenarioDisplayName: scenario.scenarioDisplayName,
          scenarioIdentification: scenario.scenarioIdentification,
          checked: true,
          id: id,
        };

        visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.applicationSrcTemplateId =
          templateId;
        visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.walmartUserId =
          process.env.cdfNormalUser as string;
        visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.viewData.scenarioIdentification[0] =
          scenario.scenarioIdentification;
        visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.viewData.scenarioOrderList[0].scenarioIdentification =
          scenario.scenarioIdentification;
        visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.allScenarios[0] =
          scenarioObject;
        visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.visualizerMetaDataDto.scenarioDtoList[0] =
          { ...scenarioObject, order: 0 };

        const view = await VisualizerUtility.visualizerSave(
          request,
          visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload
        );
        viewId = view.visualizerViewDto.visualizerViewId;
        expect(viewId).toBeTruthy();
      });
    });
  }
);
