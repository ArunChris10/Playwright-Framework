import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils";
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataEMTCreation from "../testdata/emt-layer-creation.json";
import testDataManualAdjustment from "../testdata/create-manual-adjustment-layer.json";
import testData from "../testdata/get-demand-scenario-forecast.json";
import testdatafile from '../testdata/current-demand-excel-download.json';
import testDataFileAdjustmentUpload from '../testdata/adjustment-upload-layer.json';
import testDataFile from '../testdata/adjustment-upload-layer.json';

test.describe(
  "Verify if data after adjustments can be exported as an Excel",
  {
    tag: "@Regression @ibg-service-scenario-financials @Adjustment-Download",
  },
  () => {
    let demandId, layerId, forecast, forecastVersion, forecastLayerId;

    let excelFileName = `download_${new Date().getTime()}_data.xlsx`;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.beforeAll(async ({ request }) => {
      forecastVersion = await CdfUtility.getDemandScenarioList(request);
      forecastVersion = forecastVersion.version;
      console.log("Forecast Version: ", forecastVersion);
      let forecastInfoResponse
      forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);
  
      let forecastInfoResponseBody
      forecastInfoResponseBody = await forecastInfoResponse.json();
  
      // Fetch the layerId for the forecast version of the DSS created 
      forecastInfoResponseBody.forEach(function(forecastInfo) {
          if(forecastInfo.version == forecastVersion) {
              forecastLayerId = forecastInfo.forecastLayerId;
          }
      });
    })

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
            CdfUtility.compareExcelDownloadedValuesWithAPIResponse(excelValues, forecast.map((month: any) => month.amount, testdatafile.allowedTolerance));
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
        CdfUtility.compareExcelDownloadedValuesWithAPIResponse(excelValues, forecast.map((month: any) => month.amount, testdatafile.allowedTolerance));
      });
    });

  test("Verify Export to excel is dowloading data for File Upload", async ({
    request,
  }) => {
    await test.step("Download the excel", async () => {
      let downloadExcelResponse;  
      downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, "GMV Shipped", null);     
    });

    let layerIdOfUploadLayer;
    await test.step("Update the excel by changing the value and upload the updated excel", async () => {
        let lockDSSResponseForUploadLayer;
        lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSResponseForUploadLayer).toBeOK();

        let uploadLayersResponse;

        let cellsToUpdate = [
            { position: testDataFileAdjustmentUpload.cellPositionForDepartment, value: testDataFile.valueToBeUpdated }
        ];

        uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate);

        let uploadLayersResponseBody;
        uploadLayersResponseBody = await uploadLayersResponse.json();
        
        layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
        console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);

        layerId = layerIdOfUploadLayer;

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
      CdfUtility.compareExcelDownloadedValuesWithAPIResponse(excelValues, forecast.map((month: any) => month.amount, testdatafile.allowedTolerance));
    });
  });
  }
);
    