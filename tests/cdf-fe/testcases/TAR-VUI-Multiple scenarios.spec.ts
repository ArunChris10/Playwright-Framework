import { test } from "../../common/fixtures/test-hook";
import td from "../testData/create-visualizerview.json";

const ibgNormalUserAuth = "secrets/ibg-normal-user-storagestate.json";
const testData = { ...td, viewName: 'Copy Test Automation Visualizer View' }

test.describe(
    "Multiple Scenarios (Visualizer - Super User)",
    { tag: "@Visualizer @VisualizerPublishAndCopy" },
    async () => {
        test.describe.configure({ mode: 'serial', timeout: 300_000 })

        test("Verify the copy option is not available for a super-user on the Current Demand page", async ({ pageFactory }) => {

            await test.step("Navigate to a DSS", async () => {
                await pageFactory.cdfPageFactory().demandWorkspace().navigate()
                await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS()
            })

            await test.step("Create a new visualizer view", async () => {
                await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal()
                await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName)
                await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName)
                await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate)
                await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testData.metrics);
                await pageFactory.cdfPageFactory().visualizer().publishToCurrentDemand()
                await pageFactory.cdfPageFactory().visualizer().saveView();
            })

            await pageFactory
                .cdfPageFactory()
                .currentDemand()
                .switchToVisualizerAndAssertCopyDoesNotExist(testData.viewName)
        })
    }
)

test.describe(
    "Multiple Scenarios (Visualizer - Normal User)",
    { tag: "@Visualizer @VisualizerPublishAndCopy" },
    async () => {
        test.use({ storageState: ibgNormalUserAuth })

        test(
            "Verify that both the copy (Current Demand) and the publish option (Visualizer) are not available for a normal user",
            async ({ pageFactory }) => {

            await test.step("Navigate to a DSS", async () => {
                await pageFactory.cdfPageFactory().demandWorkspace().navigate()
                await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS()
            })

            await test.step("Fill out the required Create View fields", async () => {
                await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal()
                await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName)
                await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName)
            })

            await test.step("Assert that the publish option is unavailable", async () => {
                await pageFactory.cdfPageFactory().visualizer().assertPublishCheckboxDoesNotExist()
            })

            await test.step("Verify the copy option is not available for a normal user on the Current Demand page", async () => {
                await pageFactory
                    .cdfPageFactory()
                    .currentDemand()
                    .switchToVisualizerAndAssertCopyDoesNotExist(testData.viewName)
            })
        })
    }
)

test.describe("Multiple Scenarios (Visualizer - Clean-up)",
    { tag: "@Visualizer @VisualizerPublishAndCopy" },
    async () => {
        test("Delete the view published on the Current Demand page", async ({ pageFactory }) => {
            await pageFactory.cdfPageFactory().currentDemand().navigate()
            await pageFactory.cdfPageFactory().currentDemand().switchToVisualizerTab(testData.viewName)
            await pageFactory.cdfPageFactory().currentDemand().deleteView()
        })
    }
)