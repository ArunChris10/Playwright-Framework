import { test, expect } from "../../common/fixtures/test-hook";
import testData from "../testdata/downloadscenario.json";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { CdfUtility } from "../fixtures/cdf-utils";
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testdatafile from '../testdata/current-demand-excel-download.json';

test.describe(
  "Verify Export to excel is dowloading data for both SBU and Channel View",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId, forecast, excelApiResponse;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    Object.keys(testData.organizationalLevels).forEach((organizationalKey) => {
      test(`Download excel for default filters and organizational level ${testData.organizationalLevels[organizationalKey]}`, async ({
        request,
      }) => {
        await test.step("Retrieve forecast data to use for assert", async () => {
          testData.payload.organizationalLevel = testData.organizationalLevels[organizationalKey];
          let forecastVersion = await CdfUtility.getDemandScenarioList(request);
          forecastVersion = forecastVersion.version;
          console.log("Forecast Version: ", forecastVersion);

          let forecastInfoResponse;
          forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);

          let forecastInfoResponseBody;
          forecastInfoResponseBody = await forecastInfoResponse.json();

          // Fetch the layerId for the forecast version of the DSS created 
          let forecastLayerId;
          forecastInfoResponseBody.forEach(function(forecastInfo) {
              if(forecastInfo.version == forecastVersion) {
                  forecastLayerId = forecastInfo.forecastLayerId;
              }
          });
          testData.payload.version = forecastVersion;
          const demandScenario =
            await CdfUtility.getDemandScenarioByIdAndPayload(
              request,
              demandId,
              testData.payload
            );
          if (organizationalKey === "sbu") {
            forecast = demandScenario.forecast.find(
              (sbu: any) => sbu.sbu === "CONSUMABLES"
            ).forecast;
          } else {
            forecast = demandScenario.forecast.find(
              (baseChannel: any) => baseChannel.baseChannel === "DSV_S2H"
            ).forecast;
          }
        });

        await test.step("Retrieve excel raw data as excelApiResponse", async () => {
          excelApiResponse = await CdfUtility.downloadScenario(
            request,
            demandId,
            testData
          );
        });

        await test.step("Parse excel raw data and verify the values", async () => {
          const rows = await DemandBaseClass.getSheetDataFromExcel(
            excelApiResponse
          );
          let excelValues; 
          if (organizationalKey === "sbu") {
            excelValues = Object.values(
              rows.find(
                (row: any) => row["Selection Panel"] === "CONSUMABLES"
              ) as object
            ).slice(2);
          } else {
            excelValues = Object.values(
              rows.find(
                (row: any) => row["Selection Panel"] === "DSV S2H"
              ) as object
            ).slice(3);
          }
          const expectedValues = forecast.map((data: any) => data.amount);
          CdfUtility.compareExcelDownloadedValuesWithAPIResponse(excelValues, expectedValues, testdatafile.allowedTolerance)
        });
      });
    });
  }
);
