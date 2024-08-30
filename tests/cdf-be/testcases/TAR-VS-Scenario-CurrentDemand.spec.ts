import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { VisualizerUtility } from "../fixtures/visualizer-utils";

test.describe(
  "Verify When Current Demand is used in a view it always use the most recently synced scenario.",
  { tag: "@Regression @ibg-service-visualizer" },
  () => {
    test("Verify Current Demand is most recently synced (assume there is at least 1 synced scenario)", async ({
      request,
    }) => {
      let mostRecentDss;
      let templateId;

      await test.step("Fetch most recently synced scenario", async () => {
        const demandStackScenarios =
          await CdfUtility.getDemandStackScenarioTotalList(request, false);
        mostRecentDss = demandStackScenarios.find((dss) => 
          dss.syncDate != null
        );
        expect(mostRecentDss).toBeTruthy();
      });

      await test.step("Get template id", async () => {
        const templates = await VisualizerUtility.getTemplate(
          request
        );
        templateId = templates.find((t) => t.isMergedTemplate === true)?.templateId;
        expect(templateId).toBeTruthy();
      });

      await test.step("Search scenario and assert most recently synced", async () => {
        const scenarios = (await VisualizerUtility.searchScenario(
          request,
          templateId
        ))?.scenarios;
        expect(scenarios?.length).toBeGreaterThan(0);
        const currentDemand = scenarios.find((s) => ( s?.scenarioSyncDate != null ));
        expect(currentDemand).toBeTruthy();

        const dateObject = new Date(mostRecentDss.syncDate);
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getDate()).padStart(2, '0');
        const expectedSyncDate = `SYNCED-${year}-${month}-${day}`;

        expect(currentDemand.scenarioSyncDate).toEqual(expectedSyncDate);
        expect(currentDemand.scenarioIdentification.demandStackScenarioId).toEqual(mostRecentDss.demandStackScenarioId.toUpperCase());
      });
    });
  }
);
