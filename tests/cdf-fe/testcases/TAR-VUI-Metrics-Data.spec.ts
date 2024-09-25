import { test } from "../../common/fixtures/test-hook";
import testData from "../testdata/create-visualizerview.json";

test.describe("Metric selection works in visualizer", { tag: "@Regression @Visualizer @VisualizerMetrics" }, async () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeEach(async ({ pageFactory }) => {
    await test.step("Navigate to a DSS", async () => {
      await pageFactory.cdfPageFactory().demandWorkspace().navigate();
      await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
    });
  });

  test("Verify user can select a metric and correct metric appears in table", async ({ pageFactory }) => {

    await test.step("Open Config Panel for new visualizer view", async () => {
      await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
      await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName);
      await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
      await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
      await pageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testData.hierarchys);
    });

    await test.step("User can select a metric and noly that metric appears in table", async () => {
        for (let metric of testData.allMetrics) {
            await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics([metric]);
            await pageFactory.cdfPageFactory().visualizer().verifyMetricInTable([metric]);
            await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics([metric]);
        }
    });
  });
});
