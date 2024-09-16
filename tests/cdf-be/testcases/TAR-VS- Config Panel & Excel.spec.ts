import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { VisualizerUtility } from "../fixtures/visualizer-utils";
import visualizerSaveData from "../testdata/visualizer-create-view-scenarios-list.json";

test.describe("Verify scenario is archived", { tag: "@Smoke @visualizerConfigPanel @ibg-service-visualizer @Regression" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let templateId;
  let scenario;
 
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

    let foundScenarios = [];

    scenarios.some((s) => {
    if (
        s.scenarioDisplayName.includes("DS") &&
        s.scenarioIdentification?.forecastVersion !== "NO_VERSION"
    ) {
        foundScenarios.push(s);
        return foundScenarios.length === 2;
    }
    return false;
    });

    scenario = foundScenarios;
  });

  test.afterAll(async ({ request }) => {
    await VisualizerUtility.deleteView(request, viewId);
  });

  test("Verify if Current Demand Scenario is available in Total list", async ({
    request
  }) => {
    let templateId = "";
    const templates = await VisualizerUtility.getTemplate(request);
      templateId = templates.find(
        (t) => t.isMergedTemplate === true
      )?.templateId;
      expect(templateId).toBeTruthy();

      // use a forecast scenario
      const scenarios = (
        await VisualizerUtility.searchScenario(request, templateId)
      )?.scenarios;
      const currentDemandScenario = scenarios[0]
      expect(currentDemandScenario.scenarioDisplayName.includes("Current Demand")).toBeTruthy();
      debug.log("Current Demand Scenario is available in Total list ");
  });

  test("Verify if Search Scenario order", async ({
    request
  }) => {
    let templateId = "";
    const templates = await VisualizerUtility.getTemplate(request);
      templateId = templates.find(
        (t) => t.isMergedTemplate === true
      )?.templateId;
      expect(templateId).toBeTruthy();

      // use a forecast scenario
      const scenarios = (
        await VisualizerUtility.searchScenario(request, templateId)
      )?.scenarios;
      const currentDemandScenario = scenarios[0]
      expect(currentDemandScenario.scenarioDisplayName.includes("Current Demand")).toBeTruthy();
      let isCurrentDemand = false
      let isActual = false
      let isDSForecasts = false
      let isTotal= false
      scenarios.map((c) => {
        if (c.scenarioDisplayName.includes("Current Demand")) {
            isCurrentDemand = true
            if(isActual || isDSForecasts || isTotal) {
                debug.log("order for current demand Scenario is not correct");
                expect(false, "order for current demand Scenario is not correct").toBe(true)
            }
        }
        if(c.scenarioDisplayName.includes("Actual") && c?.scenarioIdentification?.forecastVersion === "NO_VERSION") {
            isActual = true
            if(isDSForecasts || isTotal) {
                debug.log("order for Actual Scenario is not correct");
                expect(false, "order for Actual Scenario is not correct").toBe(true)
            }
            
        }
        if(c.scenarioDisplayName.includes("DS") && c?.scenarioIdentification?.forecastVersion && !c?.scenarioIdentification?.demandStackScenarioId) {
            isDSForecasts = true
            if(isTotal) {
                debug.log("order for DS Scenario is not correct");
                expect(false, "order for DS Scenario is not correct").toBe(true)
            }
        }
        if(c.scenarioDisplayName.includes("Total") && c?.scenarioIdentification?.demandStackScenarioId && !c?.scenarioSyncDate) {
            isTotal = true
        }
      });
      expect(true).toBe(true)
      debug.log("Search Scenario order test completed ");
  });

 
    test("Create the view with mutiple scenarios", async ({
            request
    }) => {    

    let scenarioObject1 =  VisualizerUtility.createScenarioObject(scenario[0])
    let scenarioObject2 =  VisualizerUtility.createScenarioObject(scenario[1])

    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.applicationSrcTemplateId =
      templateId;
    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.walmartUserId =
      process.env.cdfNormalUser as string;
    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.viewData.scenarioIdentification[0] =
      scenario.scenarioIdentification;
    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.viewData.scenarioOrderList[0].scenarioIdentification =
      scenario.scenarioIdentification;
    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.allScenarios[0] =
    scenarioObject1;
    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.allScenarios[1] =
    scenarioObject2;
    visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.visualizerMetaDataDto.scenarioDtoList[0] =
      { ...scenarioObject1, order: 0 };
      visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload.visualizerMetaDataDto.scenarioDtoList[1] =
      { ...scenarioObject2, order: 1 };  

    const view = await VisualizerUtility.visualizerSave(
      request,
      visualizerSaveData.sbuColumnDateMetricsRowExtendedPayload
    );
    viewId = view.visualizerViewDto.visualizerViewId;
    expect(viewId).toBeTruthy();
    debug.log("Create the view with mutiple scenarios completed ");
  });

  
});
