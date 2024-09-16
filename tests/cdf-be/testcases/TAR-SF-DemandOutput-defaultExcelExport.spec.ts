import { test, expect } from "../../common/fixtures/test-hook";
import testData from "../testdata/downloadscenario.json";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify Export to excel is dowloading data for all the metrics",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId, forecast, excelApiResponse, forecastVersion;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      forecastVersion = await CdfUtility.getDemandScenarioList(request);
      forecastVersion = forecastVersion.version;
      console.log("Forecast Version: ", forecastVersion)
      testData.payload.version = forecastVersion;
      const demandScenario = await CdfUtility.getDemandScenarioByIdAndPayload(
        request,
        demandId,
        testData.payload
      );
      forecast = demandScenario.forecast.find(
        (sbu: any) => sbu.sbu === "CONSUMABLES"
      ).forecast;
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    Object.keys(testData.metrics).forEach((metricKey) => {
      test(`Download excel for default filters and metric ${testData.metrics[metricKey]}`, async ({
        request,
      }) => {
        await test.step("Retrieve excel raw data as excelApiResponse", async () => {
          testData.payload.metricType = testData.metrics[metricKey];
          testData.payload.version = forecastVersion;
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
          const excelMetric = Object.values(
            rows.find(
              (row: any) => row["Selection Panel"] === "Metric"
            ) as object
          )[1];
          expect(excelMetric).toEqual(testData.payload.metricType);
          const excelValues = Object.values(
            rows.find(
              (row: any) => row["Selection Panel"] === "CONSUMABLES"
            ) as object
          ).slice(2);
          let expectedValues;
          if (testData.derivedMetrics.includes(metricKey)) {
            expectedValues = forecast
              .filter((month: any) => month.hasOwnProperty("forecastGrowth"))
              .map((month: any) => month.forecastGrowth[metricKey]);
          } else {
            expectedValues = forecast.map((month: any) => month[metricKey]);
          }
         // expect(excelValues).toEqual(expectedValues);
          CdfUtility.compareExcelDownloadedValuesWithAPIResponse(excelValues, expectedValues, 0.5)
        });
      });
    });
  }
);
