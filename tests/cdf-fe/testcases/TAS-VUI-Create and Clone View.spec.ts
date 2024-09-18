import { expect } from "@playwright/test";
import { test } from "../../common/fixtures/test-hook";
import td from "../testData/create-visualizerview.json";

const date = (new Date()).toLocaleString();
const testData = { ...td, viewName: `(${date}): Test Automation Clone Visualizer View` }

test.describe.configure({ mode: 'serial', timeout: 300_000 })
test.describe(
    "Create, Clone, List, and Delete View (Visualizer)",
    { tag: "@Visualizer @VisualizerCreateCloneAndDelete" },
    async () => {
        test.beforeEach(async ({ pageFactory }) => {
            await test.step("Navigate to a DSS", async () => {
                await pageFactory.cdfPageFactory().demandWorkspace().navigate()
                await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS()
            })
        })

        test("Clicking on Create View should open the configuration panel on the left side", async ({ pageFactory }) => {
            await test.step("Clicking on Create View should open the configuration panel on the left side", async () => {
                await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal()
                await pageFactory.cdfPageFactory().visualizer().assertLeftConfigurationPanelIsOpen()
            })

            await test.step("Finish creating a new visualizer view for subsequent tests", async () => {
                await pageFactory.cdfPageFactory().visualizer().populateNewVisualizerName(testData.viewName)
                await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName)
                await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate)
                await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testData.metrics);
                await pageFactory.cdfPageFactory().visualizer().saveView();
            })

            await test.step("Cloning a demand projection table should populate the view name of the view being cloned with ' - Copy' appended to the end", async () => {
                const copyText = ' - Copy';
                const viewName = await pageFactory
                    .cdfPageFactory()
                    .visualizer()
                    .getConfigurationPanelViewName(testData.viewName)

                expect(viewName).toContain(testData.viewName)
                expect(viewName).toContain(copyText)
            })

            await test.step("Assert the created view added to saved view section", async () => {
                await pageFactory.cdfPageFactory().visualizer().assertViewExists(testData.viewName)
            })

            await test.step("Assert the delete dialog shows and that the view can be deleted", async () => {
                await pageFactory.cdfPageFactory().visualizer().deleteViewFromList(testData.viewName)
            })
        })
    }
)