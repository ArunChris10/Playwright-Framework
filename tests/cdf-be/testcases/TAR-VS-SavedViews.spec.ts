import { expect, test } from "../../common/fixtures/test-hook";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerSaveData from "../testdata/visualizer-create-view-scenarios-list.json";

test.describe(
  "Verify save views should be displayed in tabular format with columns (view name/Last saved/owner/actions) and all newly created views are pinned by default.",
  { tag: "@Regression @ibg-service-visualizer @VisualizerSavedViews" },
  () => {
    let templateId;
    let scenario;
    let view;

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
      await VisualizerUtility.deleteView(
        request,
        view.visualizerViewDto.visualizerViewId
      );
    });

    test("Verify new view is pinned and saved views returns correct metadata", async ({
      request,
    }) => {
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

        const payloadExtension = {...visualizerSaveData.payload};
        payloadExtension.applicationSrcTemplateId = templateId;
        payloadExtension.applicationId = process.env.applicationId as unknown as number;
        payloadExtension.walmartUserId = process.env.cdfUser as string;
        payloadExtension.viewData.scenarioIdentification[0] =
          scenario.scenarioIdentification;
        payloadExtension.viewData.scenarioOrderList[0].scenarioIdentification =
          scenario.scenarioIdentification;
        payloadExtension.allScenarios[0] = scenarioObject;
        payloadExtension.visualizerMetaDataDto.scenarioDtoList[0] = {
          ...scenarioObject,
          order: 0,
        };
        view = await VisualizerUtility.visualizerSave(
          request,
          payloadExtension
        );
        expect(view).toBeTruthy();
      });

      await test.step("Verify new view is pinned and saved views returns correct metadata", async () => {
        const savedViews = (await VisualizerUtility.visualizerViews(request))
          .visualizerViewList;
        expect(savedViews.length).toBeGreaterThan(0);
        const savedView = savedViews.find(
          (v) => v.visualizerViewId === view.visualizerViewDto.visualizerViewId
        );

        // assert savedView has createdBy, lastModified, and visualizerViewName
        expect(savedView.createdBy).not.toBeNull();
        expect(savedView.lastModified).not.toBeNull();
        expect(savedView.visualizerViewName).not.toBeNull();
        expect(savedView).toEqual(view.visualizerViewDto);
        expect(savedView.isPinned).toBe(true);
      });
    });
  }
);
