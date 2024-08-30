import debug from "debug";
import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerTableData from "../testdata/visualizer-table-data.json";

test.describe(
  "Verify on selecting a hierarchy (SBU) a row is added at the bottom called Total",
  { tag: "@Regression @ibg-service-visualizer" },
  () => {
    test("Verify SBU total row (assume there is at least 1 synced scenario)", async ({ request }) => {
      let templateId;
      let scenarioIdentification;

      await test.step("Get template id", async () => {
        const templates = await VisualizerUtility.getTemplate(request);
        templateId = templates.find(
          (t) => t.isMergedTemplate === true
        )?.templateId;
        expect(templateId).toBeTruthy();
      });

      await test.step("Get scenario identification", async () => {
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
      });

      await test.step("Assert SBU total row", async () => {
        const payloadExtension = visualizerTableData.sbuExtendedPayload;
        payloadExtension.scenarioIdentification = [
          scenarioIdentification,
        ] as any;
        payloadExtension.scenarioOrderList[0].scenarioIdentification =
          scenarioIdentification;
        const tableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId,
          payloadExtension
        );

        // Assert SBU total row
        expect(tableData.some((row) => row.sbuId === -1)).toBe(true);
      });
    });
  }
);
