import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import testdata from "../testdata/forecast-api.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import forecastData from '../testdata/forecast-api.json'

test.describe("The @Forecast API @regression", () => {

  test.describe.configure({ timeout: 120_000,mode: 'serial' });
  let forecastCreated;
  let forecastsCreated = forecastData.scenario_id;

  test("Verify if the user is able to @createforecast", async ({
    request,
  }) => {
    forecastCreated = await UfmUtility.createForecast('merch', request);
    debug.log("Forecast is created  : ", forecastCreated);
  });

  test("Verify if the user is able to @deleteForecast", async ({
    request
  }) => {
    let forecastDeleted = await UfmUtility.deleteForecast(forecastCreated,request);
    debug.log("Forecast is deleted  : ", forecastDeleted);
  
    let scenarios = forecastData.scenario_id;
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}${scenarios}`;
    const response = await request.delete(endpointURL, { data: forecastData.deleteForecastPayload.scenario});
    expect(response).toBeOK();
    let message = forecastData.deleteMessage.replace('scenario_id',forecastCreated);
    let responseBody = await UfmUtility.deleteForecast(forecastsCreated, request);
    expect(responseBody.message).toEqual(message)
    debug.log(JSON.stringify(responseBody));

  });
});