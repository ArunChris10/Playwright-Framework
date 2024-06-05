import testdata from "../testdata/getkpiforecast.json";
import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";

test.describe("Verify the @GetKPIForecast API @Smoke @Regression", { tag: "@Regression @Smoke @GetKPIForecast" }, () => {
  let apiResponse, apiResponseBody;
  // API endpoint URL
  const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
  debug.log(endpointURL);

  test("Verify if the user is able to get data for the selected @Node and @Filter combination", async ({
    context,
  }) => {
    // Call the Get KPI Forecast API with the filter and Node combination
    await test.step("Make a Post Request for getting the forecast data", async () => {
      debug.log("Make a Post Request for getting the forecast data");
      apiResponse = await context.request.post(endpointURL, {
        data: testdata,
      });
    });

    // Check if the response is success
    await test.step("Check if the response message is success", async () => {
      await expect(apiResponse).toBeOK();
      apiResponseBody = await apiResponse.json();
      debug.log(JSON.stringify(apiResponseBody));
    });

    // Check if the response columns header matches withe payload Month filter
    await test.step("Check if the response columns header matches with the payload Month filter", async () => {
      let extractMonthNames = function (columnObjects, fieldName) {
        let columns = columnObjects.filter(
          (column: any) => column.columnsMenuParams === "middleColumns"
        );
        return columns.map((obj: any) => obj[fieldName]);
      };
      let expectedValue = extractMonthNames(
        testdata.additional_filters.template_include_headers,
        "name"
      );
      let actualValue = extractMonthNames(apiResponseBody.columnDefs, "field");

      expect(actualValue).toMatchObject(expectedValue);

      // check if the rowdata is not empty
      await test.step("Check if the response body has the forecast data", async () => {
        expect(apiResponseBody.rowData).not.toEqual([]);
      });
    });
  });
});
