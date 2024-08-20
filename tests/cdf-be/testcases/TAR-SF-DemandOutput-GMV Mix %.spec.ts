import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import getDemandScenario from '../testdata/get-demand-scenario-forecast.json';
import debug from "debug";

test.describe("Verify if user can see the data for GMV mix % (xxx.xx 2 decimals)", { tag: "@Regression @VerifyGMVMix" }, () => {

  let demandId;
  let demandScenarioDetails;
  let scenarioForecast;
  let scenarioForecastBaseChannel;
  let scenarioForecastTotals;
  let month, forecastMonth, actualMonth, year, actualYear, forecastYear;
  let plusMinusMonths;

  test.beforeAll(async ({ request }) => { 
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
        
        let payload = getDemandScenario.payloadDssForecastGmvMixData;
        payload.version = forecastVersion;
        payload.includeDerivedMetrics = true;
        payload.organizationalLevel = "SBU";
        let resp = await CdfUtility.getDemandScenarioForecast(request, demandId, payload);
        scenarioForecast = resp.forecast;
        scenarioForecastTotals = resp.forecastTotals.grandTotal;

        plusMinusMonths = getDemandScenario.plusMinusMonths;

    })

    await test.step("Verify GMVMix% for forecast data", async () => {
      CdfUtility.verifyGMVMixPercentage(scenarioForecast, scenarioForecastTotals, plusMinusMonths);
    })

    await test.step("Verify GMVMix% for actual data", async () => {
      CdfUtility.verifyGMVMixPercentage(scenarioForecast, scenarioForecastTotals, -plusMinusMonths);
    })

  });
})