import { test } from "../../common/fixtures/test-hook";
import testData from "../testdata/create-visualizerview.json";

test.describe("Pause Refresh in Visualizer when Saving", { tag: "@Regression @Visualizer @VisualizerPause" }, async () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeEach(async ({ pageFactory }) => {
    await test.step("Navigate to a DSS", async () => {
      await pageFactory.cdfPageFactory().demandWorkspace().navigate();
      await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
    });
  });

  test("Verify visualzier view is not paused when saving", async ({ pageFactory }) => {
    await test.step("Open Config Panel for new visualizer view", async () => {
      await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
      await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName);
      await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
      await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
      await pageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testData.hierarchys);
      await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testData.metric);
    });
    
    await test.step("Pause refresh", async () => {
        await pageFactory.cdfPageFactory().visualizer().pauseRefreshToggleButton();
    });

    await test.step("Save and assert it is unpaused", async () => {
      await pageFactory.cdfPageFactory().visualizer().saveView();
    });

    await test.step("Delete View", async () => {
      await pageFactory.cdfPageFactory().visualizer().deleteView()
    });
  });
});
