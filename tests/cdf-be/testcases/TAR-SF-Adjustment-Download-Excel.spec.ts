import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { UploadLayerUtil } from "../fixtures/upload-layer";
import testDataEMTCreation from "../testdata/emt-layer-creation.json";
import testDataManualAdjustment from "../testdata/create-manual-adjustment-layer.json";
import testData from "../testdata/get-demand-scenario-forecast.json";

test.describe(
  "Verify if data after adjustments can be exported as an Excel",
  {
    tag: "@Regression @ibg-service-scenario-financials @Adjustment-Download",
  },
  () => {
    let demandId, layerId, forecast;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify Export to excel is dowloading data for EMT", async ({
      request,
    }) => {
        await test.step("Lock DSS", async () => {
            const lockResponse = await LockUnlockUtility.lockDSSData(
              request,
              demandId
            );
            expect(lockResponse).toBeOK();
        });

        await test.step("Create EMT and fetch forecast", async () => {
            testDataEMTCreation.payload.layers[0].forecastVersion =
              CdfUtility.createScenarioPayload.forecastInfoDTO.forecastInfo.version;
            testDataEMTCreation.payload.layers[0].allocationType =
              "CONVERTED_SALE";
            testDataEMTCreation.payload.layers[0].userId =
              process.env.cdfUser || "";
            testDataEMTCreation.payload.layers[0].allocationUnitType =
              "MOVE_UNIT_1_1";
            const response =
              await AdjustmentUtility.createEMTLayer(
                request,
                demandId,
                testDataEMTCreation
              );
            expect(response).toBeOK();
            layerId = (await response.json())[0].layerId;
            testData.payloadWithMinimumData.layerIds = [layerId] as any;
            forecast = (
              await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                request,
                demandId
              )
            ).forecast.find((sbu: any) => sbu.sbu === "CONSUMABLES").forecast;;
        });

        await test.step("Download Excel and verify", async () => {
            const excelApiResponse = await CdfUtility.downloadScenario(
              request,
              demandId,
              {
                endpoint: "/api/demandscenarios/",
                payload: testData.payloadWithMinimumData,
              }
            );
            const rows = await AdjustmentUtility.getSheetDataFromExcel(
              excelApiResponse
            );
            const excelValues = Object.values(
              rows.find(
                (row: any) => row["Selection Panel"] === "CONSUMABLES"
              ) as object
            ).slice(2);
            expect(excelValues).toEqual(
              forecast.map((month: any) => month.amount)
            );
        });
    });

    test("Verify Export to excel is dowloading data for Manual Hierarchy", async ({
      request,
    }) => {

      await test.step("Lock DSS", async () => {
        const lockResponse = await LockUnlockUtility.lockDSSData(
          request,
          demandId
        );
        expect(lockResponse).toBeOK();
      });    
    
      await test.step("Create Manual and fetch forecast", async () => {
        testDataManualAdjustment.payload.layers[0].forecastVersion =
          CdfUtility.createScenarioPayload.forecastInfoDTO.forecastInfo.version;
        const response = await AdjustmentUtility.createManualAdjustmentLayer(
          request,
          demandId,
          testDataManualAdjustment
        )
        expect(response).toBeOK();
        layerId = (await response.json())[0].layerId;
        testData.payloadWithMinimumData.layerIds = [layerId] as any;
        forecast = (
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId
          )
        ).forecast.find((sbu: any) => sbu.sbu === "CONSUMABLES").forecast;
      });

      await test.step("Download Excel and verify", async () => {
        const excelApiResponse = await CdfUtility.downloadScenario(
          request,
          demandId,
          {
            endpoint: "/api/demandscenarios/",
            payload: testData.payloadWithMinimumData,
          }
        );
        const rows = await AdjustmentUtility.getSheetDataFromExcel(
          excelApiResponse
        );
        const excelValues = Object.values(
          rows.find(
            (row: any) => row["Selection Panel"] === "CONSUMABLES"
          ) as object
        ).slice(2);
        expect(excelValues).toEqual(forecast.map((month: any) => month.amount));
      });
    });

    test("Verify Export to excel is dowloading data for File Upload", async ({
      request,
    }) => {
      await test.step("Upload excel file and fetch forecast", async () => {
        testDataManualAdjustment.payload.layers[0].forecastVersion =
          CdfUtility.createScenarioPayload.forecastInfoDTO.forecastInfo.version;
        const response = await UploadLayerUtil.verifyUploadExcel(
          request,
          demandId,
          CdfUtility.createScenarioPayload
        );
        layerId = response[0].layerId;
        testData.payloadWithMinimumData.layerIds = [layerId] as any;
        forecast = (
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId
          )
        ).forecast.find((sbu: any) => sbu.sbu === "CONSUMABLES").forecast;
      });

      await test.step("Download Excel and verify", async () => {
        const excelApiResponse = await CdfUtility.downloadScenario(
          request,
          demandId,
          {
            endpoint: "/api/demandscenarios/",
            payload: testData.payloadWithMinimumData,
          }
        );
        const rows = await AdjustmentUtility.getSheetDataFromExcel(
          excelApiResponse
        );
        const excelValues = Object.values(
          rows.find(
            (row: any) => row["Selection Panel"] === "CONSUMABLES"
          ) as object
        ).slice(2);
        expect(excelValues).toEqual(forecast.map((month: any) => month.amount));
      });
    });
  }
);
    