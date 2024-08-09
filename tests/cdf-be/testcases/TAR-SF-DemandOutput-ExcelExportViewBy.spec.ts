import { test, expect } from "../../common/fixtures/test-hook";
import testData from "../testdata/downloadscenario.json";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify Export to excel is dowloading data for all aggregation views year, quarter and month",
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

    Object.keys(testData.aggregationTypes).forEach((aggregationKey) => {
      test(`Download excel for default filters and aggregation view ${testData.aggregationTypes[aggregationKey]}`, async ({
        request,
      }) => {
        await test.step("Retrieve forecast data to use for assert", async () => {
          testData.payload.timeFilter.filterLevel =
            testData.aggregationTypes[aggregationKey];
          const demandScenario =
            await CdfUtility.getDemandScenarioByIdAndPayload(
              request,
              demandId,
              testData.payload
            );
          if (aggregationKey === "month") {
            forecast = demandScenario.forecast.find(
              (sbu: any) => sbu.sbu === "CONSUMABLES"
            ).forecast;
          } else if (aggregationKey === "quarter") {
            forecast = demandScenario.quarterlyForecast.find(
              (sbu: any) => sbu.sbu === "CONSUMABLES"
            ).forecast;
          } else {
            forecast = demandScenario.yearlyForecast.find(
              (sbu: any) => sbu.sbu === "CONSUMABLES"
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
          const excelValues = Object.values(
            rows.find(
              (row: any) => row["Selection Panel"] === "CONSUMABLES"
            ) as object
          ).slice(2);
          const expectedValues = forecast.map((data: any) => data.amount);
          expect(excelValues).toEqual(expectedValues);
        });
      });
    });
  }
);
