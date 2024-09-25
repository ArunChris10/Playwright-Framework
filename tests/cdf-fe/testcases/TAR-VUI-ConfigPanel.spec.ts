import { test } from "../../common/fixtures/test-hook";
import testData from "../testdata/create-visualizerview.json";

test.describe("Config Panel", { tag: "@Regression @Visualizer @ConfigPanel @ibg-visualizer-ui" }, async () => {

    test.beforeEach( async ({ pageFactory }) => {
        await test.step("Navigate to a DSS", async () => {
            await pageFactory.cdfPageFactory().demandWorkspace().navigate();
            await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
        });

        await test.step("Open config panel for new visualizer view", async () => {
            await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
            await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName);
            await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
            await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
            await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testData.metrics);
        });
    });

    test("Verify Only 3 calculated scenarios can be created at a time (gray out + when 3 are made)", async ({ pageFactory }) => {
        const customScenarioName = testData.scenarioName + " - Custom";
        await test.step("Create 3 calculated scenarios", async () => {
            await pageFactory.cdfPageFactory().visualizer().createScenario(customScenarioName, [testData.scenarioName], testData.customOperation);
            await pageFactory.cdfPageFactory().visualizer().createScenario(customScenarioName, [testData.scenarioName], testData.customOperation);
            await pageFactory.cdfPageFactory().visualizer().createScenario(customScenarioName, [testData.scenarioName], testData.customOperation);
        });

        await test.step("Verify if the add new scenario button is disabled", async () => {
            await pageFactory.cdfPageFactory().visualizer().verifyAddCustomScenarioButtonIsDisabled();
        });
    });

    test("Verify YoY% and YoY Difference can only be selected for a single Scenario.", async ({ pageFactory }) => {
        const customScenarioName = testData.scenarioName + " - Custom";
        let nameOfTheDSS;
        await test.step("Add another scenario from the list of scenarios", async () => {
            nameOfTheDSS = await pageFactory.cdfPageFactory().visualizer().searchScenarioNameByPassingThePosition(2, 1);
        });

        await test.step("Considering the metrics Sum, Difference, % difference and check if both the scenarios are selectable and none of them are disabled", async () => {
            for(let eachMetric of testData.customOperationMetricsForScenariosSelectable) {
                await pageFactory.cdfPageFactory().visualizer().createScenarioWithValidationForChecking(customScenarioName, [testData.scenarioName,nameOfTheDSS], eachMetric);
            }
        });

        await test.step("Considering the metrics Year over year %, YoY Difference and check if only one of them is selectable and the other metric is disabled", async () => {
            for(let eachMetric of testData.customOperationMetricsForScenariosDisabled) {
                await pageFactory.cdfPageFactory().visualizer().createScenarioWithValidationForChecking(customScenarioName, [testData.scenarioName,nameOfTheDSS], eachMetric);
            }
        });

        await test.step("Select the 2 scenarios passed and verify Year over year % and YoY Difference are disabled", async () => {
            await pageFactory.cdfPageFactory().visualizer().verifyMetricsDisablingForMultipleScenarioSelection(customScenarioName, [testData.scenarioName,nameOfTheDSS], testData.customOperationMetricsForScenariosDisabled);
        });
    });

    test("Verify the user can select scenarios from their available scenarios via checkbox. We do not allow the user to select from calculated scenarios.", async ({ pageFactory }) => {
        const customScenarioName = testData.scenarioName + " - Custom";

        await test.step("Create a custom scenario", async () => {
            await pageFactory.cdfPageFactory().visualizer().createScenario(customScenarioName, [testData.scenarioName], testData.customOperation);
        }); 

        await test.step("When creating a new custom scenario, validate that this new calculated scenario is not present", async () => {
            await pageFactory.cdfPageFactory().visualizer().verifyCalculatedScenarioIsNotPresent(customScenarioName);
        });
    });

    test("Verify Visualizer Configuration Panel should close when a user leaves the Visualizer Page selects another view or goes to saved views.", async ({ pageFactory}) => {
        await test.step("Create a new view", async () => {
            await pageFactory.cdfPageFactory().visualizer().saveView();
        });

        await test.step("Click on the Edit View button", async () => {
            await pageFactory.cdfPageFactory().visualizer().openSettings();
        });
        
        await test.step("Click on Adjustment Layers tab near views", async () => {
            await pageFactory.cdfPageFactory().demandOutput().clickForecastProjectionTab('Adjustment Layers');
        });

        await test.step("Validate if the configuration panel is closed", async () => {
            await pageFactory.cdfPageFactory().visualizer().verifyIfConfigurePanelIsClosed();
        });
    });
});