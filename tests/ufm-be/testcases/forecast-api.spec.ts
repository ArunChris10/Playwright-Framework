import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import testdata from "../testdata/forecast-api.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import forecastData from '../testdata/forecast-api.json'

test.describe("The @Forecast API @regression", () => {

  test.describe.configure({ timeout: 120_000,mode: 'serial' });
  let forecastCreated;
  let dimId = forecastData.deleteForecastPayload.scenario.dim_id;
  let dimValId = forecastData.deleteForecastPayload.scenario.dim_val_id;

  test("Verify if the user is able to @createforecast", async ({
    request,
  }) => {
    forecastCreated = await UfmUtility.createForecast('merch', request);
    debug.log("Forecast is created  : ", forecastCreated);
  });

  test("Verify if the user is able to @deleteForecast", async ({
    request
  }) => {
    let forecastDeleted = await UfmUtility.deleteForecast(forecastCreated,dimId, dimValId, request);
    debug.log("Forecast is deleted  : ", forecastDeleted);
    expect(forecastDeleted).toBeOK();
    let message = forecastData.deleteMessage.replace('scenario_id',forecastCreated);
    expect(forecastDeleted.message).toEqual(message)
    debug.log(JSON.stringify(forecastDeleted));
  });
});