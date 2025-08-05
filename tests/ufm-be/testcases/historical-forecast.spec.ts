import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import PBASBAList from "../constants/PBA_SBA_List.json";
import commonData from "../constants/common.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import testdatafile from "../testdata/historical-forecast.json";
import usersData from "../constants/ufm_users.json";

let lobList = PBASBAList.SBAList;

lobList.forEach((lobName) => {
  test.describe(
    "Validation of Historical Forecast",
    { tag: "@Regression @Smoke @Historical_Forecast @perf @ibg-ufm-metadata-service @ibg-ufm-core-service" },
    () => {
      let responseData;
      // API endpoint URL
      const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;

      Utility.logIt(endpointURL);
      let userList = usersData.users;

      userList.forEach(async (user) => {
        test(`For User ${user} Check the list of historical forecast for ${lobName}`, async ({
          request,
        }) => {
          responseData = await request.get(endpointURL, {

            params: {
              dim_id: commonData.ba_dim_id,
              classification_id: commonData.classification_id,
              dim_val_id: await UfmUtility.getMapping(
                lobName,
                "dim_val_id",
                "SBA"
              ),
              data_level: commonData.lob_dim_id,
            },
          });
          Utility.assertAndLog(responseData);
        });

        //Fetch the historical forecasts and verify the SBA type
        // test(
        //   "Check the list of historical forecast for " + sba_date.forecastname,
        //   async ({}) => {
        //     //Make a get call and verify the historical forecast names contain the SBA name
        //     await test.step(
        //       "Check if all the Historical forecast name contains " +
        //         sba_date.forecastname,
        //       async () => {
        //         Utility.logIt(
        //           "Check the SBA Name " +
        //             sba_date.forecastname +
        //             " in Historical forecast"
        //         );

        //         //identify the historical forecast names using the key 'name' from the list of object array
        //         forcastNames = responseBody.row_data.map((obj: any) => obj.name);
        //         Utility.logIt("Forecast names is : " + forcastNames);

        //         //Using ForeEach loop iterating all the forecasts available in Historical forecast list
        //         forcastNames.forEach((forecast: string) => {
        //           Utility.logIt(
        //             "Previously Submitted Forecast name is :" + forecast
        //           );

        //           //Validating the expected sba name contains in historical forecast
        //           expect(forecast).toContain(sba_date.forecastname);
        //           Utility.logIt(
        //             "Historical forecast is of " +
        //               sba_date.forecastname +
        //               " SBA type"
        //           );
        //         });
        //       }
        //     );
        //   }
        // );

        // test(
        //   "validate the list @count for " + sba_date.forecastname,
        //   async ({}) => {
        //     //Fetching the count of Historical forecasts
        //     await test.step(
        //       "Verify the count of historical forecast of " +
        //         sba_date.forecastname,
        //       async () => {
        //         hist_forecast_count = responseBody.row_data.length;
        //         Utility.logIt(
        //           "Number of Forecasts already submitted and showing in Historical forecast section is :" +
        //             hist_forecast_count
        //         );
        //       }
        //     );

        //     //Verifying the count of total historical forecast to be 12
        //     await test.step("Verify the count of historical forecast", async () => {
        //       if (hist_forecast_count == testdata.forecast_count) {
        //         Utility.logIt(
        //           "The historical forecast count is " + testdata.forecast_count
        //         );
        //       } else {
        //         expect(hist_forecast_count).toEqual(testdata.forecast_count);
        //         Utility.logIt(
        //           "The historical forecast count is not " +
        //             testdata.forecast_count
        //         );
        //       }
        //     });
        //   }
        // );
      });
    }
  );
});
