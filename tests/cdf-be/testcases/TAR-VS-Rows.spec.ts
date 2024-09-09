import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerTableData from "../testdata/visualizer-table-data.json";

test.describe(
  "Verify user have ability to change table view(Show/Hide Merch/Base Channel Group Channels SBUs Departments) and user can Re-order rows as required",
  { tag: "@Regression @ibg-service-visualizer @VisualizerRows" },
  () => {
    let templateId;
    let scenarioIdentification;
    let tableData;
    let extendedPayload = visualizerTableData.sbuMerchChannelExtendedPayload;

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

    test("Verify user can change table view for hierarchy rows on a saved view", async ({
      request,
    }) => {
      await test.step("Show Merch Channel and SBU", async () => {
        tableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId,
          extendedPayload
        );
        expect(
          tableData.every(
            (parentRow) =>
              parentRow.sbuId &&
              parentRow.rows.every((row) => row.channelGroupId)
          )
        ).toBeTruthy();
      });

      await test.step("Hide Merch Channel and show SBU", async () => {
        tableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId,
          visualizerTableData.sbuExtendedPayload
        );
        expect(
          tableData.every(
            (parentRow) => parentRow.sbuId && parentRow?.rows === undefined
          )
        ).toBeTruthy();
      });
    });

    test("Verify user can re-order rows", async ({ request }) => {
      await test.step("Order: Merch Channel, SBU", async () => {
        extendedPayload.rows.reverse();
        tableData = await VisualizerUtility.getVisualizerTableData(
          request,
          templateId,
          extendedPayload
        );
        expect(
          tableData.every(
            (parentRow) =>
              parentRow.channelGroupId &&
              parentRow.rows.every((row) => row.sbuId)
          )
        ).toBeTruthy();
      });
    });
  }
);
