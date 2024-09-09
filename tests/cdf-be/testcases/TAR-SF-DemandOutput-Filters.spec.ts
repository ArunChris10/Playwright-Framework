import { debug } from "debug";
import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import testData from '../testdata/cdfFilter.json';

test.describe(
  "Verify Demand Output Filters.",
  {
    tag: "@Regression @ibg-service-scenario-financials @verifyDSOutputFilters",
  },
  () => {
    let demandStackId,
      demandScenarioDetails,
      startYear;
    test.describe.configure({ mode: "serial" });
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
        debug.log(response);
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
          debug.log(response);
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
          debug.log(response);
        expect(response.forecast[0].forecast.find((forecast) => forecast.year == startYear).forecastGrowth).toBeUndefined()
        expect(response.forecast[0].forecast.find((forecast) => forecast.year == startYear+1 && forecast.month == 3).forecastGrowth).toBeDefined()
      });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);

test.describe(
  "Check if the user switches to any metric from YOY Growth % , the Year filters should be resetted back to inlcude Fy20",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
      let demandId, payloadExtension, forecast;

      test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

      test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

      test("YOY Growth % metrics should not have FY20 or first year, but other metrics should", async ({ request }) => {
          payloadExtension = {
            metricUnit: "GMV YoY Growth %",
            timeFilter: testData.timeFilter,
          };
          // selecting YoY Growth % metric, FE removes first year in payload
          payloadExtension.timeFilter.years.shift();
          payloadExtension.timeFilter.yearList.shift();
          forecast = (await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(request, demandId, payloadExtension)).yearlyForecast[0].forecast;
          expect(forecast[0].year).not.toBe(2020);
          payloadExtension.metricUnit = "GMV Shipped";
          payloadExtension.timeFilter.yearList.unshift("FY 2020");
          payloadExtension.timeFilter.years.unshift("2020");
          forecast = (await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(request, demandId, payloadExtension)).yearlyForecast[0].forecast;
          expect(forecast[0].year).toBe(2020);
      })
  }
);
