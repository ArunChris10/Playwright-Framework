import { test } from "../../common/fixtures/test-hook";
import testData from "../testdata/create-visualizerview.json";

test.describe("Custom Scenario and Metric in Visualizer Config Panel", { tag: "@Regression @Visualizer @VisualizerCustomScenarioMetric" }, async () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test.beforeEach(async ({ pageFactory }) => {
    await test.step("Navigate to a DSS", async () => {
      await pageFactory.cdfPageFactory().demandWorkspace().navigate();
      await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
    });

    await test.step("Open Config Panel for new visualizer view", async () => {
      await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
      await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName);
      await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
      await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
      await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testData.metric);
    });
  });

  test("Verify user can create, edit, and delete custom scenario and metric", async ({ pageFactory }) => {
    const customScenarioName = testData.scenarioName + " - Custom";
    const customMetricName = testData.metric[0] + " - Custom";

    await test.step("Verify If the user hits Add calculation button this calculated metric and scenario is added to the list of scenarios immediately following the final value selected to create the calculation.", async () => {
      await pageFactory.cdfPageFactory().visualizer().createScenario(customScenarioName, [testData.scenarioName], testData.customUnaryOperation);
      await pageFactory.cdfPageFactory().visualizer().verifyScenarioInPosition(customScenarioName);
      await pageFactory.cdfPageFactory().visualizer().createMetric(customMetricName, testData.metric, testData.customUnaryOperation);
      await pageFactory.cdfPageFactory().visualizer().verifyMetricInPosition(customMetricName, 1);
    });

    await test.step("Verify If Edit is hit for custom scenario and metric open an edit popup with the same options as if this screen was selected in the configuration panel.", async () => {
      await pageFactory.cdfPageFactory().visualizer().verifyCanEditCalculation(customScenarioName);
      await pageFactory.cdfPageFactory().visualizer().verifyCanEditCalculation(customMetricName);
    });

    await test.step("Verify If the user selects delete the metric will be removed from the view as well as the configuration panel.", async () => {
      await pageFactory.cdfPageFactory().visualizer().deleteCalculation(customMetricName);
    });

    await test.step("Verify if user delete a scenario associated with a custom scenario the custom scenario is also deleted along with it.", async () => {
      await pageFactory.cdfPageFactory().visualizer().removeScenario(testData.scenarioName, [customScenarioName]);
    });
  });
});
