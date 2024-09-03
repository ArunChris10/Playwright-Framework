import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerTableData from "../testdata/visualizer-table-data.json";

test.describe(
  "Verify on selecting a hierarchy a row is added at the bottom called Total",
  { tag: "@Regression @ibg-service-visualizer @VisualizerTotalRow" },
  () => {
    let templateId;
    let scenarioIdentification;

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

    test("Verify on selecting a hierarchy (SBU) a row is added at the bottom called Total", async ({
      request,
    }) => {
      const tableData = await VisualizerUtility.getVisualizerTableData(
        request,
        templateId,
        visualizerTableData.sbuExtendedPayload
      );

      // Assert SBU total row
      expect(tableData.some((row) => row.sbuId === -1)).toBe(true);
    });

    test("Verify on selecting a hierarchy (Department) a row is added at the bottom called Total", async ({
      request,
    }) => {
      const tableData = await VisualizerUtility.getVisualizerTableData(
        request,
        templateId,
        visualizerTableData.departmentExtendedPayload
      );

      // Assert Department total row
      expect(tableData.some((row) => row.departmentId === -1)).toBe(true);
    });

    test("Verify on selecting a hierarchy (Channel group) a row is added at the bottom called Total", async ({
      request,
    }) => {
      const tableData = await VisualizerUtility.getVisualizerTableData(
        request,
        templateId,
        visualizerTableData.channelGroupExtendedPayload
      );

      // Assert Channel group total row
      expect(tableData.some((row) => row.channelGroupId === -1)).toBe(true);
    });

    test("Verify on selecting a hierarchy (Channel) a row is added at the bottom called Total", async ({
      request,
    }) => {
      const tableData = await VisualizerUtility.getVisualizerTableData(
        request,
        templateId,
        visualizerTableData.channelExtendedPayload
      );

      // Assert Channel total row
      expect(tableData.some((row) => row.baseChannelId === -1)).toBe(true);
    });
  }
);
