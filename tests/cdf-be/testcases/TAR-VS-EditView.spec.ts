import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerSaveData from "../testdata/visualizer-create-view-scenarios-list.json";

test.describe(
  "Verify User should have ability to Edit the changes made to the selection criteria by clicking on the Wrench icon from the controls panel on the right side of the output section",
  { tag: "@Regression @ibg-service-visualizer @VisualizerEdit" },
  () => {
    let templateId;
    let scenario;
    let payloadExtension;
    let view;
    let editedView;

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
    });

    test.afterAll(async ({ request }) => {
      await VisualizerUtility.deleteView(request, view.visualizerViewId);
    });

    test("Verify edit view", async ({ request }) => {
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

        payloadExtension = visualizerSaveData.payload;
        payloadExtension.applicationSrcTemplateId = templateId;
        payloadExtension.walmartUserId = process.env.cdfNormalUser as string;
        payloadExtension.viewData.scenarioIdentification[0] =
          scenario.scenarioIdentification;
        payloadExtension.viewData.scenarioOrderList[0].scenarioIdentification =
          scenario.scenarioIdentification;
        payloadExtension.allScenarios[0] = scenarioObject;
        payloadExtension.visualizerMetaDataDto.scenarioDtoList[0] = {
          ...scenarioObject,
          order: 0,
        };

        view = (
          await VisualizerUtility.visualizerSave(request, payloadExtension)
        ).visualizerViewDto;
        expect(view).toBeTruthy();
      });

      await test.step("Edit the view", async () => {
        payloadExtension.visualizerViewName = "test - Edit";
        payloadExtension.type = "edit";
        payloadExtension.visualizerViewId = view.visualizerViewId;
        payloadExtension.updatedBy = process.env.cdfNormalUser as string;
        editedView = (
          await VisualizerUtility.visualizerSave(request, payloadExtension)
        ).visualizerViewDto;
        expect(editedView.visualizerViewName).not.toEqual(
          view.visualizerViewName
        );

        // clear out different values so we can assert
        editedView.visualizerViewName = view.visualizerViewName;
        editedView.lastModified = view.lastModified;
        expect(editedView).toEqual(view);
      });
    });
  }
);
