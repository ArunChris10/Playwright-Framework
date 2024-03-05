import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import testdata from "../testdata/forecast-api.json";
import { UfmUtility } from "../fixtures/ufm-utils";

test.describe("The @Forecast API @Regression @Smoke", () => {

  test.describe.configure({ timeout: 120_000,mode: 'serial' });
  let forecastCreated
  test("Verify if the user is able to @createforecast", async ({
    request,
  }) => {
    forecastCreated = await UfmUtility.createForecast('merch', request);
    debug.log("Forecast is created  : ", forecastCreated);
  });

  test("Verify if the user is able to @deleteforecast", async ({
    request,
  }) => {
    let forecastDeleted = await UfmUtility.deleteForecast(forecastCreated,request);
    debug.log("Forecast is deleted  : ", forecastDeleted);
  });
});