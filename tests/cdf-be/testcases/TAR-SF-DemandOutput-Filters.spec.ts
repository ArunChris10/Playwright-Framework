import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";

test.describe(
  "Verify Demand Output Filters.",
  {
    tag: "@Regression @ibg-service-scenario-financials @verifyDSOutputFilters",
  },
  () => {
    let demandStackId,
      demandScenarioDetails,
      startYear;

    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(
        request,
        demandStackId
      );
    });

    test("Verify first year Demand Stack output does not contain YoY metrics in Year view", async ({ request }) => {
        const response = await DemandBaseClass.getDemandScenarioForecast(
            request,
            demandStackId,
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
            "YEAR"
          );
        startYear = parseInt(response.cutOffDate.split("-")[0]) - 5;
        expect(response.yearlyForecast[0].forecast.find((forecast) => forecast.year == startYear).forecastGrowth).toBeUndefined()
        expect(response.yearlyForecast[0].forecast.find((forecast) => forecast.year == startYear+1).forecastGrowth).toBeDefined()
      });

      test("Verify first year Demand Stack output does not contain YoY metrics in Quarter View", async ({ request }) => {
        const response = await DemandBaseClass.getDemandScenarioForecast(
            request,
            demandStackId,
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
            "QUARTER"
          );
        expect(response.quarterlyForecast[0].forecast.find((forecast) => forecast.year == startYear).forecastGrowth).toBeUndefined()
        expect(response.quarterlyForecast[0].forecast.find((forecast) => forecast.year == startYear+1).forecastGrowth).toBeDefined()
      });

      test("Verify first year Demand Stack output does not contain YoY metrics in Month View", async ({ request }) => {
        const response = await DemandBaseClass.getDemandScenarioForecast(
            request,
            demandStackId,
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
            "MONTH"
          );
        expect(response.forecast[0].forecast.find((forecast) => forecast.year == startYear).forecastGrowth).toBeUndefined()
        expect(response.forecast[0].forecast.find((forecast) => forecast.year == startYear+1 && forecast.month == 3).forecastGrowth).toBeDefined()
      });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);
