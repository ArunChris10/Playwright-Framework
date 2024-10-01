import { expect } from "@playwright/test";
import { test } from "../../common/fixtures/test-hook";
import td from "../testdata/create-visualizerview.json";

const date = new Date().toLocaleString();
const testData = { ...td, viewName: `(${date}): Test Automation Clone Visualizer View` };

test.describe.configure({ mode: "serial", timeout: 300_000 });
test.describe("Visualizer Saved Views", { tag: "@Regression @Visualizer @ibg-visualizer-ui @VisualizerSavedViews" }, async () => {
  const savedViews: string[] = [];

  test.beforeEach(async ({ pageFactory }) => {
    await pageFactory.cdfPageFactory().demandWorkspace().navigate();
    await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
    await pageFactory.cdfPageFactory().visualizer().openCreateNewVisualizerModal();
    await pageFactory
      .cdfPageFactory()
      .visualizer()
      .populateNewVisualizerName(testData.viewName + " - 0");
    await pageFactory.cdfPageFactory().visualizer().searchForNewScenario(testData.scenarioName);
    await pageFactory.cdfPageFactory().visualizer().chooseNewDateRange(testData.viewDateType, testData.startDate, testData.endDate);
    await pageFactory.cdfPageFactory().visualizer().chooseNewMetrics(testData.metric);
    await pageFactory.cdfPageFactory().visualizer().saveView();
    savedViews.push(testData.viewName + " - 0");
    await pageFactory.cdfPageFactory().visualizer().openSavedViews();
    for (let i = 1; i <= 2; i++) {
      const copyName = testData.viewName + " - " + i;
      await pageFactory.cdfPageFactory().visualizer().copySavedView(testData.viewName, copyName);
      savedViews.push(copyName);
    }
    // close and open to avoid flakiness
    await pageFactory.cdfPageFactory().visualizer().closeSavedViews();
    await pageFactory.cdfPageFactory().visualizer().openSavedViews();
    await pageFactory.cdfPageFactory().visualizer().unpinAllSavedViews();
  });

  test.afterEach(async ({ pageFactory }) => {
    await pageFactory.cdfPageFactory().visualizer().openSavedViews();
    for (const view of savedViews) {
      await pageFactory.cdfPageFactory().visualizer().deleteViewFromList(view);
    }
  });

  test("Verify menu items and pinning in saved views", async ({ pageFactory }) => {
    await test.step("Verify clicking on ellipses open a menu to select - Delete/Rename", async () => {
      await pageFactory.cdfPageFactory().visualizer().verifySavedViewsEllipsisMenu(savedViews[0]);
    });

    await test.step("Verify user can pin the view so that they are easily accessible and reorder to the top to be visible in the tabs.", async () => {
      await pageFactory.cdfPageFactory().visualizer().pinSavedView(savedViews[2]);
      expect(await pageFactory.cdfPageFactory().visualizer().isSavedViewPinned(savedViews[2])).toBe(true);
    });

    await test.step("Verify pinned tab will be the top in the view list", async () => {
      expect(await pageFactory.cdfPageFactory().visualizer().getSavedViewAtRowIndex(0)).toBe(savedViews[2]);
    });

    await test.step("Verify The top 2 views (Pinned or unpinned) will be displayed on the tab bar above.", async () => {
      const firstView = savedViews[2];
      const secondView = await pageFactory.cdfPageFactory().visualizer().getSavedViewAtRowIndex(1);
      // reopen the DSS to avoid flakiness
      await pageFactory.cdfPageFactory().demandWorkspace().navigate();
      await pageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
      await pageFactory.cdfPageFactory().visualizer().verifyViewTabs(firstView, secondView);
    });
  });
});
