import { test } from "../../common/fixtures/test-hook";
import testdata from "../testdata/create-visualizerview.json";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "New Visualizer View",
  { tag: "@Smoke @Visualizer" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });

    test(
      "Verify User can create a visualizer view and save it",
      { tag: "@createVisualizer" },
      async () => {
        test.setTimeout(500000);
        await test.step("Open the demand stack scenario", async () => {
            await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
        })
        await test.step("Open create new visualizer modal", async () => {
            await objpageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
        })
        await test.step("Enter new visualizer name", async () => {
            await objpageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testdata.viewName);
        })
        await test.step("Search for a new scenario", async () => {
            await objpageFactory.cdfPageFactory().visualizer().searchForNewScenario(testdata.scenarioName);
        })
        await test.step("Choose date type and range for new view", async () => {
            await objpageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testdata.viewDateType, testdata.startDate, testdata.endDate);
        })
        await test.step("Choose hierarchys for new view", async () => {
            await objpageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testdata.hierarchys);
        })
        await test.step("Choose metrics for ner view", async () => {
            await objpageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testdata.metrics);
        })
        await test.step("Finally save visualizer view", async () => {
            await objpageFactory.cdfPageFactory().visualizer().saveView();
        })
        await test.step("Verify visualizer view is correct", async () => {
            await objpageFactory.cdfPageFactory().visualizer().verifyView(testdata.hierarchys);
        })
      }
    );

    test (
        "Pin and Unpin Views test",
        {tag: "@pin/unpinSavedViews"},
        async () => {
            test.setTimeout(500000);
            await test.step("Open saved views", async () => {
                await objpageFactory.cdfPageFactory().visualizer().openSavedViews();
            })

            await test.step("Unpin saved view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().unpinSavedView(testdata.viewName);
            })

            await test.step("Pin saved view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().pinSavedView(testdata.viewName);
            })

            
        }
    );
}
);
