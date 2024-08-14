import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import getDemandScenario from '../testdata/get-demand-scenario-forecast.json';
import debug from "debug";

test.describe("Verify if the FY20 or first year values are populated/not-populated in table based upon YOY metrics", { tag: "@Regression @VerifyDemandDataYoY" }, () => {

  let demandId;
  let demandScenarioDetails;
  let scenarioForecast;
  let scenarioForecastBaseChannel;
  let scenarioForecastTotals;
  let firstYear;

  test.beforeAll(async ({ request }) => { 
    console.log("endpointURL");
    demandId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await AdjustmentUtility.getDemandStackDetails(
        request,
        demandId
    );
  });

  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request, demandId);
  });

  test("Verify if YoY are present for the first year", async ({
    request
  }) => {
    await test.step("getting all the data", async () => {
        let forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
        
        let payload = getDemandScenario.payloadDssForecastData;
        payload.version = forecastVersion;
        payload.includeDerivedMetrics = true;
        payload.organizationalLevel = "SBU";
        let resp = await CdfUtility.getDemandScenarioForecast(request, demandId, payload);
        scenarioForecast = resp.yearlyForecast;
        scenarioForecastTotals = resp.forecastTotals.grandTotal.forecast;

        payload.includeDerivedMetrics = false;
        payload.organizationalLevel = "BASE_CHANNEL";
        payload.includeTotals = false;
        let resp1 = await CdfUtility.getDemandScenarioForecast(request, demandId, payload);
        scenarioForecastBaseChannel = resp1.yearlyForecast;

        const currentDate = new Date();
        let year = currentDate.getFullYear();
        firstYear = year - 4;

    })

    await test.step("Verify that YoY are not present for first year", async () => {
      expect(scenarioForecastTotals[0]["forecastGrowth"]).toBeUndefined();
    })

    await test.step("Verify the FY20 Values are populated in table for non YOY Metrics in SBU view", async () => {
      const containsFirstYear = scenarioForecast.some((item: { forecast: { year: number; }[]; }) => {
        if (item.forecast) {
          return item.forecast.some((innerItem: { year: number; }) => innerItem.year === firstYear);
        }
        return false;
      });
      CdfUtility.assertFY2020WithinTolerance(containsFirstYear);
    })

    await test.step("Verify the FY20 Values are populated in table for non YOY Metrics in BASE_CHANNEL view", async () => {
      const containsFirstYear = scenarioForecastBaseChannel.some((item: { forecast: { year: number; }[]; }) => {
        if (item.forecast) {
          return item.forecast.some((innerItem: { year: number; }) => innerItem.year === firstYear);
        }
        return false;
      });
      CdfUtility.assertFY2020WithinTolerance(containsFirstYear);
    })



  });
})