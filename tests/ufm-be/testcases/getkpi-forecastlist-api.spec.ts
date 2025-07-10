import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import getKpiData from "../testdata/getKpi.json";
import testdata from "../testdata/getkpiforecast.json";
import PBASBAList from "../constants/PBA_SBA_List.json";
import commonData from "../constants/common.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import usersData from "../constants/ufm_users.json";

// let lobList = PBASBAList.SBAList;
let lobList = ["SCHEDULED"];

lobList.forEach((lobName) => {
  test.describe(
    "Verify the GetKPIForecast API",
    { tag: "@Regression @Smoke @GetKPIForecast @perf" },
    () => {
      let apiResponse, apiResponseBody, monthYear;
      // API endpoint URL
      const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
      Utility.logIt(endpointURL);
      let userList = usersData.users;
      userList.forEach(async (user) => {
        test(`For User : ${user} Verify if the user is able to get data for the Fiscal year for ${lobName}`, async ({
          request,
        }) => {
          test.setTimeout(600000);
          let scenario_details, isNewCreated;
          monthYear = await Utility.getFiscalYearMonthList();
          if (
            (await ForecastUtility.countOfScenario(lobName, user, request)) >=
            commonData.MAX_SCENARIO_COUNT
          ) {
            await ForecastUtility.deleteAllforecastofUser(
              request,
              lobName,
              user
            );
          }
          //Getting forecast details
          [scenario_details, isNewCreated] =
            await ForecastUtility.getOrCreateForecastIfNotExists(
              lobName,
              request
            );

          // Call the Get KPI Forecast API with the filter and Node combination
          await test.step("Make a Post Request for getting the forecast data", async () => {
            Utility.logIt("Make a Post Request for getting the forecast data");
            const endpointURL = `${process.env.apiBaseURLUFM}${getKpiData.endpoint}`;
            const inputNodes = await UfmUtility.getDriverList(
              lobName,
              "Input",
              request,
            );
            let kpiPayload = await UfmUtility.kpiPayload(
              lobName,
              scenario_details,
              [],
              monthYear,
              inputNodes
            );
            apiResponse = await request.post(endpointURL, {

              data: kpiPayload,
            });
          });

          // Check if the response is success
          await test.step("Check if the response message is success", async () => {
            apiResponseBody = await Utility.assertAndLog(apiResponse);
          });
        });

        // Check if the response columns header matches withe payload Month filter
        // await test.step("Check if the response columns header matches with the payload Month filter", async () => {
        //   let extractMonthNames = function (columnObjects, fieldName) {
        //     let columns = columnObjects.filter(
        //       (column: any) => column.columnsMenuParams === "middleColumns"
        //     );
        //     return columns.map((obj: any) => obj[fieldName]);
        //   };
        //   let expectedValue = extractMonthNames(
        //     testdata.additional_filters.template_include_headers,
        //     "name"
        //   );
        //   let actualValue = extractMonthNames(
        //     apiResponseBody.columnDefs,
        //     "field"
        //   );

        //   expect(actualValue).toMatchObject(expectedValue);

        //   // check if the rowdata is not empty
        //   await test.step("Check if the response body has the forecast data", async () => {
        //     Utility.logIt(apiResponseBody.rowData);
        //     // expect(apiResponseBody.rowData).not.toEqual([]);
        //   });
        // });
      });
    }
  );
});
