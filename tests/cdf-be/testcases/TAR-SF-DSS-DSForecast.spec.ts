import debug from "debug";
import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";

test.describe(
  "Verify DSS forecasts show correct status",
  {
    tag: "@Regression @ibg-service-scenario-financials @DSS",
  },
  () => {
    let demandId;
    let demandScenarioDetails;
    let latestId;
    let latestVersion;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(
        request,
        demandId
      );
      latestId = demandScenarioDetails.forecastInfoDTO.forecastInfo.id;
      latestVersion =
        demandScenarioDetails.forecastInfoDTO.forecastInfo.version;
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify in Demand workspace - DataScience output page usercan see 'Latest' instead of 'New'", async ({
      request,
    }) => {
      expect(demandScenarioDetails.forecastInfoDTO.forecastInfo.status).toBe(
        "Latest"
      );
    });

    test("Verify the older Forecast should have a status Available ", async ({
      request,
    }) => {
      const demandStackScenarios =
        await CdfUtility.getDemandStackScenarioTotalList(request, false);
      demandStackScenarios.forEach((dss) => {
        if (
          dss.forecastInfoDTO.forecastInfo.id === latestId &&
          dss.forecastInfoDTO.forecastInfo.version === latestVersion
        ) {
          expect(dss.forecastInfoDTO.forecastInfo.status).toBe("Latest");
        } else {
          expect(dss.forecastInfoDTO.forecastInfo.status).toBe("Available");
        }
      });
    });
  }
);
