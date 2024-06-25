import { test } from "../../common/fixtures/test-hook";
import testdata from "../testdata/create-visualizerview.json";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "New Visualizer View Creation Tests",
  { tag: "@Smoke @Visualizer" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });

    test(
      "Verify User can create a new visualizer view and save it",
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
        "Verify visualizer filters are present",
        {tag: "@VisualizerFilters"},
        async () => {
            test.setTimeout(500000);
            await test.step("Open saved views", async () => {
                await objpageFactory.cdfPageFactory().visualizer().verifyFiltersPresent(testdata.filters);
            })
        }
    );

    test (
        "Testing Custom Calculated Scenario Creation",
        {tag: "@calculatedScenarioCreation"},
        async () => {
            test.setTimeout(500000);
            
            await test.step("Open create new visualizer modal", async () => {
                await objpageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
            })
            await test.step("Enter new visualizer name", async () => {
                await objpageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testdata.viewName);
            })
            await test.step("Search for a new scenario", async () => {
                await objpageFactory.cdfPageFactory().visualizer().searchForNewScenario(testdata.customScenariosCreatedFrom[0]);
            })
            await test.step("Search for a new scenario", async () => {
                await objpageFactory.cdfPageFactory().visualizer().searchForNewScenario(testdata.customScenariosCreatedFrom[1]);
            })
            await test.step("Choose date type and range for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testdata.viewDateType, testdata.startDate, testdata.startDate);
            })
            await test.step("Choose hierarchys for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testdata.hierarchys);
            })
            await test.step("Create custom scenario for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().createScenario(testdata.customScenarioName, testdata.customScenariosCreatedFrom, testdata.customScenarioOperation);
            })
            await test.step("Choose metrics for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testdata.metric);
            })
            await test.step("Finally save visualizer view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().saveView();
            })
            await test.step("Verify custom scenario has been created", async () => {
                await objpageFactory.cdfPageFactory().visualizer().verifyCustomScenarioView([...testdata.customScenariosCreatedFrom, testdata.customScenarioName], testdata.customScenarioOperation);
            })
        }
    );

    test (
        "Testing Custom Calculated Metric Creation",
        {tag: "@calculatedMetricCreation"},
        async () => {
            test.setTimeout(500000);
            
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
                await objpageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testdata.viewDateType, testdata.startDate, testdata.startDate);
            })
            await test.step("Choose hierarchys for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewHierarchys(testdata.hierarchys);
            })
            await test.step("Choose metrics for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testdata.metrics);
            })
            await test.step("Create custom metric for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().createMetric(testdata.customMetricName, testdata.customMetricCreatedFrom, testdata.customMetricOperation);
            })
            await test.step("Finally save visualizer view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().saveView();
            })
            await test.step("Verify custom metric has been created", async () => {
                await objpageFactory.cdfPageFactory().visualizer().verifyCustomMetric(testdata.customMetricName, testdata.customMetricOperation);
            })
            
        }
    );
    
    test (
        "Testing pause refresh button on visualizer view",
        {tag: "@pauseRefresh"},
        async () => {
            test.setTimeout(500000);
            
            await test.step("Open create new visualizer modal", async () => {
                await objpageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
            })
            await test.step("Enter new visualizer name", async () => {
                await objpageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testdata.viewName);
            })
            await test.step("Pause refresh", async () => {
                await objpageFactory.cdfPageFactory().visualizer().pauseRefreshToggleButton();
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
            await test.step("Choose metrics for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testdata.metrics);
            })
            await test.step("See if table has been refreshed", async () => {
                await objpageFactory.cdfPageFactory().visualizer().temporaryPauseRefreshCheck();
            })
            await test.step("Finally save visualizer view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().saveView();
            })
           
        }
    );
  
    test (
        "Verify user can publish to current demand",
        {tag: "@VisualizerPublishCurrentDemand"},
        async () => {
            test.setTimeout(500000);
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
            await test.step("Choose metrics for new view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testdata.metrics);
            })
            await test.step("Publish to current demand", async () => {
                await objpageFactory.cdfPageFactory().visualizer().publishToCurrentDemand();
            })
            await test.step("Finally save visualizer view", async () => {
                await objpageFactory.cdfPageFactory().visualizer().saveView();
            })
            await test.step("Navigate to current demand page", async () => {
                await objpageFactory.cdfPageFactory().currentDemand().navigate();
            })
            await test.step("Verify DSS has been published", async () => {
                await objpageFactory.cdfPageFactory().currentDemand().verifyVisualizerViewPublished(testdata.viewname);
            })
            await test.step("reset back to main page", async () => {
                await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
                await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
            })
        }
    );

    test (
        "Pin and Unpin different visualizer views on saved views page test",
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
