import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import getDemandScenario from '../testdata/get-demand-scenario-forecast.json';
import debug from "debug";

test.describe("Verify User can be able to see yearly totals in all DSS listing for all the metrics for 2 years current Fy and next FY", { tag: "@Regression @VerifyDssAll @verifyDSSDataAll" }, () => {

  let demandId;
  let demandScenarioDetails;
  let matchedDss;
  let scenarioForecast;
  let scenarioTotals;
  let currentYear;
  let nextYear

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

  test("Verify if yearly total are present for 2 years", async ({
    request
  }) => {
    await test.step("getting all the data", async () => {
        let forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
        let payload = getDemandScenario.payloadGetAllDssList;
        payload.forecastVersion = forecastVersion;
        let allDssListResponse = await CdfUtility.getAllDSSList(request, payload);

        let payload1 = getDemandScenario.payloadDssForecastData;
        payload1.version = forecastVersion;
        let resp = await CdfUtility.getDemandScenarioForecast(request, demandId, payload1);
        scenarioForecast = resp.forecastTotals.grandTotal.forecast;

        let payload2 = getDemandScenario.payloadDssfromAllList;
        const currentDate = new Date();
        let year = currentDate.getFullYear();
        currentYear = year + 1;
        nextYear = year + 2;
        let years: string[] = [currentYear.toString(), nextYear.toString()];
        let yearList: string[] = ["FY " + currentYear, "FY " + nextYear];
        payload2.timeFilter.years = years;
        payload2.timeFilter.yearList = yearList;
        payload2.version = forecastVersion;
        matchedDss = CdfUtility.getMatchedDss(allDssListResponse, demandId);
        let dssfromAllListData = await CdfUtility.getDemandScenarioForecast(request, matchedDss.demandStackScenarioId, payload2);
        debug.log(JSON.stringify(dssfromAllListData));
        scenarioTotals = dssfromAllListData.forecastTotals.grandTotal.forecast;

    })

    await test.step("Verify yearly total are present for 2 years", async () => {
        expect(scenarioTotals.length).toBe(2);
        expect(scenarioTotals[0]["year"]).toBe(currentYear);
        expect(scenarioTotals[1]["year"]).toBe(nextYear);
    })

    await test.step("Verify yearly total match with demand data output", async () => {
        let currentYearForecastTotal, nextYearForecastTotal;
        for(let i = 0; i<scenarioForecast.length; i++) {
            if (scenarioForecast[i]["year"] == currentYear) {
                currentYearForecastTotal = scenarioForecast[i]["amount"];
            }

            if (scenarioForecast[i]["year"] == nextYear) {
                nextYearForecastTotal = scenarioForecast[i]["amount"];
            }
        }

        expect(scenarioTotals[0]["amount"]).toBe(currentYearForecastTotal);
        expect(scenarioTotals[1]["amount"]).toBe(nextYearForecastTotal);
    })

  });
})