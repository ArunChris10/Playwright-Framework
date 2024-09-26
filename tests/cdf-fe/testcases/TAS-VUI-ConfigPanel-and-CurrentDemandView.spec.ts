import { test } from "../../common/fixtures/test-hook";
import testdata from "../testdata/create-visualizerview.json";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "Visualizer Configure pannel tests",
  { tag: "@Smoke @VisualizerConfigure" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
    });

    test("verify user can view all the dafault columns for Scenario and metric", async () => {
      test.setTimeout(500000);
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
      await test.step("Open the demand stack scenario", async () => {
        await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
      });
      await test.step("Open create new visualizer modal", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .openCreateNewVisualizerModal();
      });
      await test.step("Enter new visualizer name", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .populateNewVisualizerName(testdata.viewName);
      });
      await test.step("Search for a new scenario", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .searchForNewScenario(testdata.scenarioName);
      });
      await test.step("Choose date type and range for new view", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .chooseNewDateRange(
            testdata.viewDateType,
            testdata.startDate,
            testdata.endDate
          );
      });
      await test.step("Choose hierarchys for new view", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .chooseNewHierarchys(testdata.merchChannelHierarchy);
      });
      await test.step("Choose metrics for ner view", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .chooseNewMetrics(testdata.metrics);
      });
      await test.step("Verify default rows and columns are visible", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .verifydefaultRowsVisible();
      });
    });

    test("Verify custom metric options are disabled on selecting more than one metric", async () => {
      test.setTimeout(500000);
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
      await test.step("Open the demand stack scenario", async () => {
        await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
      });
      await test.step("Open create new visualizer modal", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .openCreateNewVisualizerModal();
      });
      await test.step("Enter new visualizer name", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .populateNewVisualizerName(testdata.viewName);
      });
      await test.step("Search and select first three scenarios", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .searchAndSelectScenario(3);
      });

      await test.step("Search and select first three scenarios", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .verifyCustomMetricSelectionOptions();
      });
    });

    test("Verify filters in demand and current demand for visualizer config pannel", async () => {
      test.setTimeout(500000);
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
      await test.step("Open the demand stack scenario", async () => {
        await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
      });
      await test.step("Open create new visualizer modal", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .openCreateNewVisualizerModal();
      });
      await test.step("Enter new visualizer name", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .populateNewVisualizerName(testdata.viewName);
      });
      await test.step("Search for a new scenario", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .searchForNewScenario(testdata.scenarioName);
      });
      await test.step("Choose date type and range for new view", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .chooseNewDateRange(
            testdata.viewDateType,
            testdata.startDate,
            testdata.endDate
          );
      });
      await test.step("Choose hierarchys for new view", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .chooseNewHierarchys(testdata.hierarchys);
      });
      await test.step("Choose metrics for new view", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .chooseNewMetrics(testdata.metrics);
      });
      await test.step("Publish to current demand", async () => {
        await objpageFactory
          .cdfPageFactory()
          .visualizer()
          .publishToCurrentDemand();
      });
      await test.step("Finally save visualizer view", async () => {
        await objpageFactory.cdfPageFactory().visualizer().saveView();
      });
      await test.step("Navigate to current demand page", async () => {
        await objpageFactory.cdfPageFactory().currentDemand().navigate();
      });
      await test.step("Verify DSS has been published", async () => {
        await objpageFactory
          .cdfPageFactory()
          .currentDemand()
          .verifyVisualizerViewPublished(testdata.viewName);
      });
      await test.step("Verify configure pannel in current demand screen", async () => {
        await objpageFactory
          .cdfPageFactory()
          .currentDemand()
          .verifyCurrentDemandConfigurePannel();
      });
    });
  }
);
