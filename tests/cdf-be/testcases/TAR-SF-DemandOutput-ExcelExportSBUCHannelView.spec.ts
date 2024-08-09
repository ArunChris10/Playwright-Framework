import { test, expect } from "../../common/fixtures/test-hook";
import testData from "../testdata/downloadscenario.json";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { CdfUtility } from "../fixtures/cdf-utils";

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
            // TODO: this is giving different values
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
          expect(excelValues).toEqual(expectedValues);
        });
      });
    });
  }
);
