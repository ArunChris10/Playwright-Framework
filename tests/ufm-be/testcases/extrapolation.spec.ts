import { expect, test } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import getKpiData from "../testdata/getKpi.json";
import getDriverData from "../testdata/extrapolation-lob.json";
import { testData } from "../testdata/extrapolation-lob.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/visual-indicator-api.json";
import { getPreviousAndNextData,comparePreviousAndNext } from "../fixtures/extrapolation-utils";
import { RowData } from '../type/types';

Object.entries(testData).forEach(([lob, testData]) => {

  let scenario_details;
  let adjustment_metadata;
  let adjustment_id;
  let adjustmentDetails: any;
  let getAllAdjustmentsCountBefore;
  let getAllAdjustmentsCountAfter;
  let responseBody;
  let actualSyncTime;

  test.describe(
    "Verify adjustments API",
    { tag: "@Smoke @Regression @extrapolation123" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });
      test(`Getting or creating forecast for LOB - ${testData.lobName}`, async ({
        request,
      }) => {
        if (
          (await ForecastUtility.countOfScenario(
            testData.lobName,
            process.env.ufmUser,
            request
          )) >= commonData.MAX_SCENARIO_COUNT
        ) {
          await ForecastUtility.deleteAllforecastofUser(
            request,
            testData.lobName,
            process.env.ufmUser
          );
        }
        //Getting forecast details
        const scenarioId =
          await ForecastUtility.createForecast(
            testData.lobName,
            request
          );

        let currentForecast = await UfmUtility.getCurrentForecastList(
          testData.lobName,
          request
        );

        scenario_details = await UfmUtility.getScenarioDetails(
          currentForecast,
          scenarioId
        );
        console.log("scenario_details", scenario_details)
      });

      test(`Verify newly created scenario doesn't contain any adjustments for - ${testData.lobName}`, async ({
        request,
      }) => {

        let getAllAdjustments = await AdjustmentUtility.getAllAdjustments(scenario_details["scenarioId"], scenario_details["scenarioVersion"], testData.lobName, request)

        expect(getAllAdjustments).toEqual([])

      });
      
      let GetDefaultDriverResponse;
      test(`Get default driver for LOB - ${testData.lobName}`, async ({ request }) => {
         GetDefaultDriverResponse = await UfmUtility.getDefaultDriverList(
          testData.lobName,        
          request
        );
        console.log("GetDefaultDriverResponse:", GetDefaultDriverResponse);
      });
      
      test(`Verify if the API is returning Actuals, forecast, and extrapolated forecast dates`, async ({request,}) => {
        const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;
        Utility.logIt(endpointURL);
        const responseBody = await test.step(
          "Make a GET request for getting actual dates",
          async () => {
            Utility.logIt("Make a GET request for getting updated dates");
            const response = await request.get(endpointURL, {              
              params: { classification_id: testdatafile.classification_id },
            });
            await Utility.assertAndLog(response);
            return JSON.parse(await response.text());
          }
        );
        // Find the entry with dataset_type "Actuals updated"
      const actuals = Array.isArray(responseBody) ? responseBody.find(item => item.dataset_type === "Actuals updated") : undefined;

      // Extract actual_sync_time
       actualSyncTime = actuals?.actual_sync_time;

      console.log("Actuals value:", actualSyncTime); // Outputs: 202602
      });

      let GetKPIAapiResponse, apiResponseBody;
      test(`Get Kpi for given driver and validate the extrapolation`, async ({ request }) => {
        let monthYear = await Utility.generateMonthArray(actualSyncTime); // get 12 months before and 12 months after values for given actual sync time
        const endpointURL = `${process.env.apiBaseURLUFM}${getKpiData.endpoint}`;

        for (const driver of GetDefaultDriverResponse) {
          console.log(`Processing driver: ${driver}`);
          let kpiPayload = await UfmUtility.kpiPayload(
        testData.lobName,
        scenario_details,
        [],
        monthYear,
        [driver]
          );

          GetKPIAapiResponse = await request.post(endpointURL, { data: kpiPayload });
          console.log(`KPI API Response JSON for driver ${driver}:`, await GetKPIAapiResponse.json());

          const kpiResponseBody: { rowData: RowData[] } = await GetKPIAapiResponse.json();

          if (!kpiResponseBody.rowData?.length) {
        console.error(`No rowData found in response for driver ${driver}.`);
        continue;
          }

          const row = kpiResponseBody.rowData[0];
          const { previousMap, nextMap } = getPreviousAndNextData(row, actualSyncTime);
          const mismatches = comparePreviousAndNext(previousMap, nextMap);

          console.log(`Non-matching value pairs for driver ${driver}:`);
          console.table(mismatches);
        }
      });
      test(`Teardown for deleting forecast for lob - ${testData.lobName}`, async ({
        request,
      }) => {

        await ForecastUtility.deleteForecast(
          scenario_details["scenarioId"],
          scenario_details["scenarioVersion"],
          commonData.ba_dim_id,
          await UfmUtility.getMapping(testData.lobName, "dim_val_id"),
          request
        );
      });
    });
 
  })


