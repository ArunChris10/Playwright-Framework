import testdatafile from "../testdata/baseline-api.json";
import { test, expect } from '../../common/fixtures/test-hook'
import debug from "debug";

test.describe("Validating the baseline forecast Details @Regression @baseline", () => {
  let apiResponse, apiResponseBody, forcastNames;
  // API endpoint URL
  const testdata = testdatafile;
  const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
  debug.log(endpointURL);

  test("Checking the baseline Details includes Primary forecast", async ({ context }) => {
    //get request for the baseline details includes Primary forecast
    await test.step("Make a Get Request for baseline Details including Primary forecast", async () => {
      debug.log("Make a Get Request for baseline Details including Primary forecast");
      //API Request
      const apiResponse = await context.request.get(endpointURL, {
        params: {
          ...testdatafile.queryParams,
          "include_primary": testdata.include_primary
        }
      });
      //Extracting the response body     
      apiResponseBody = await apiResponse.json();
      debug.log('API response:', apiResponseBody);

    });
    //Assertion
    await test.step("Check Api response which includes Primary forecast ", async () => {

      //identify the baseline forecast names using the key 'name' from the list of object array
      forcastNames = apiResponseBody.row_data.map((obj: any) => obj.name);
      debug.log('Forecast names are : ' + forcastNames)
      // checking that the result contains primary forecast
      expect(forcastNames).toContain(testdata.forecast_name);
      debug.log('sba name contains Primary forecast');

    });
  });
  test("Checking the baseline Details excluding Primary forecast ", async ({ context }) => {
    //get request for the baseline details excluding Primary forecast
    await test.step("Make a Get Request for baseline Details excluding Primary forecaste", async () => {
      debug.log("Make a Get Request for baseline Details excluding Primary forecast");
      //API Request
      const apiResponse = await context.request.get(endpointURL, {
        params: {
          ...testdatafile.queryParams,
          "include_primary": testdata.exclude_primary
        }
      });

      //Extracting the response body
      apiResponseBody = await apiResponse.json();
      debug.log('API response:', apiResponseBody);
    });

    //Assertion
    await test.step("Check Api response which excludes Primary forecast ", async () => {
      //identify the baseline forecast names using the key 'name' from the list of object array
      forcastNames = apiResponseBody.row_data.map((obj: any) => obj.name);
      debug.log('Forecast names are : ' + forcastNames)
      // checking that the result does not contain primary forecast
      expect(forcastNames).not.toContain(testdata.forecast_name);
      debug.log('sba name does not contain Primary forecast');

    });
  });
});
