import { test } from "../../common/fixtures/test-hook";
import testData from "../testdata/create-visualizerview.json";

test.describe("Metric search in Visualizer", { tag: "@Regression @Visualizer @VisualizerMetrics" }, async () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeEach(async ({ pageFactory }) => {
    await test.step("Navigate to a DSS", async () => {
      await pageFactory.cdfPageFactory().demandWorkspace().navigate();
      await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
    });
  });

  test("Verify user can search for metric on the config panel", async ({ pageFactory }) => {

    await test.step("Open Config Panel for new visualizer view", async () => {
      await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
      await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName);
      await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
      await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
      await pageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testData.hierarchys);
    });

    await test.step("User can search for metric and only that metric appears", async () => {
        for (let metric of testData.allMetrics) {
            await pageFactory.cdfPageFactory().visualizer().searchForMetric(metric.slice(0,3));
            await pageFactory.cdfPageFactory().visualizer().verifyMetricInPosition(metric, 0);
        }
    });
  });
});
