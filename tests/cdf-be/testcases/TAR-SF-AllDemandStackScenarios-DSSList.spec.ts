import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify new DSS is displayed on All Demand Stack Scenarios",
  {
    tag: "@Regression @newDssList @@ibg-service-scenario-financials @DSS",
  },
  () => {
    let demandId;

    test.beforeAll(async ({ request }) => {
        demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify user should able to see the other demand stacks scenarios associated with a DS Forecast with all the summary details ", async ({ request }) => {

        let demandScenarioResponse = await CdfUtility.fetchallForecast(
          request
        );

        let isId = false;
        for (let i = 0; i < demandScenarioResponse.length; i++){
            let currentDdsId = demandScenarioResponse[i].demandStackScenarioId;
            isId;
            if (currentDdsId === demandId){
                isId = true;
            }
        }
        expect(isId).toBeTruthy();
    });
});