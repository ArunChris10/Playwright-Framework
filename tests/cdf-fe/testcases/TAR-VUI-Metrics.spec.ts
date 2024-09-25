import { test } from "../../common/fixtures/test-hook";
import testData from "../testdata/create-visualizerview.json";

test.describe("Metric View More capability", { tag: "@Regression @Visualizer @VisualizerMetrics" }, async () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeEach(async ({ pageFactory }) => {
    await test.step("Navigate to a DSS", async () => {
      await pageFactory.cdfPageFactory().demandWorkspace().navigate();
      await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
    });
  });

  test("Verify user can view more metrics if more than 5 exist", async ({ pageFactory }) => {

    await test.step("Open Config Panel for new visualizer view", async () => {
      await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
      await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName);
      await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
      await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
      await pageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testData.hierarchys);
    });

    await test.step("Create new custom metric", async () => {
      await pageFactory.cdfPageFactory().visualizer().createMetric(testData.customMetricName, testData.metric, testData.customUnaryOperation);
    });

    await test.step("Verify there is a view more option", async () => {
        await pageFactory.cdfPageFactory().visualizer().viewMoreMetrics([...testData.allMetrics, testData.customMetricName]);
    });
  });
});
