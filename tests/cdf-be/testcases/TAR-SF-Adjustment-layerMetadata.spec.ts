import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { ManageRebaseUtility } from "../fixtures/manage-rebase-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import testdatafileCreateManualAdjustment from '../testdata/create-manual-adjustment-layer.json';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataFileAdjustmentUpload from '../testdata/adjustment-upload-layer.json';
import testDataFile from '../testdata/adjustment-upload-layer.json';


test.describe("Verify as a user, I want to select the Intel Layer and click on expansion arrow and view the details of Intel Layer. I want ability to view details of data whether it is GMV data or Converted Sales, etc.",
  { tag: "@Regression @intellayergmvdatascannedunitsdetails @ibg-service-scenario-financials @Adjustment" }, () => {
    let demandStackId,
      demandScenarioDetails,
      forecastVersion,
      forecastLayerId;

      let excelFileName = `download_${new Date().getTime()}_data.xlsx`;

    test.describe.configure({ mode: "serial" });
    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
        request,
        demandStackId
      );
    });

    test.beforeAll(async ({ request }) => {
      forecastVersion = await CdfUtility.getDemandScenarioList(request);
      forecastVersion = forecastVersion.version;
      console.log("Forecast Version: ", forecastVersion);
      let forecastInfoResponse
      forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandStackId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);
  
      let forecastInfoResponseBody
      forecastInfoResponseBody = await forecastInfoResponse.json();
  
      // Fetch the layerId for the forecast version of the DSS created 
      forecastInfoResponseBody.forEach(function(forecastInfo) {
          if(forecastInfo.version == forecastVersion) {
              forecastLayerId = forecastInfo.forecastLayerId;
          }
      });
    })

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandStackId); });

    test("Verify that in emt layer whether it is gmv or scanned units or converted sales", async ({
      request
    }) => {
      await test.step("Verify that in emt layer whether it is gmv", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let emtLayerResponseGmv = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "DOLLAR", "GMV-TEST");
        let layerIdGmv = emtLayerResponseGmv[0].layerId;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        for (let i = 0; i < getdemandStack.layers.length; i++) {
          if (getdemandStack.layers[i].layerId == layerIdGmv) {
            const jsonData = JSON.parse(getdemandStack.layers[i].layerJson);
            expect(jsonData.allocationType).toEqual("DOLLAR");
            break;
          }
        }
      })

      await test.step("Verify that in emt layer whether it is converted sales", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let emtLayerResponseConvertedSales = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "CONVERTED_SALE", "CONVERTED-SALES-TEST");
        let layerIdConvertedSales = emtLayerResponseConvertedSales[0].layerId;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        for (let i = 0; i < getdemandStack.layers.length; i++) {
          if (getdemandStack.layers[i].layerId == layerIdConvertedSales) {
            const jsonData = JSON.parse(getdemandStack.layers[i].layerJson);
            expect(jsonData.allocationType).toEqual("CONVERTED_SALE");
            break;
          }
        }
      })

      await test.step("Verify that in emt layer whether it is scanned units", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let emtLayerResponseScannedUnits = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "UNIT", "SCANNED-UNITS-TEST");
        let layerIdScannedUnits = emtLayerResponseScannedUnits[0].layerId;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        for (let i = 0; i < getdemandStack.layers.length; i++) {
          if (getdemandStack.layers[i].layerId == layerIdScannedUnits) {
            const jsonData = JSON.parse(getdemandStack.layers[i].layerJson);
            expect(jsonData.allocationType).toEqual("UNIT");
            break;
          }
        }
      })

    });


    test("Verify if Layer Type is displayed in the Adjustment Layer list table to identify Manual or EMT or Upload", async ({
      request
    }) => {
      await test.step("Verify if Layer Type is displayed in the Adjustment Layer list table to identify EMT", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let emtLayerResponseGmv = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "DOLLAR", "GMV-TEST");
        let layerTypeemt = emtLayerResponseGmv[0].layerType;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        let emt = false;
        for (let i = 0; i < getdemandStack.layers.length; i++) {
          if (getdemandStack.layers[i].layerType === layerTypeemt) {
            emt = true;
            break;
          }
        }
        expect(emt).toEqual(true);
      });

      await test.step("Verify if Layer Type is displayed in the Adjustment Layer list table to identify Manual", async () => {
        let createManualAdjustmentLayerDataResponse;
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        testdatafileCreateManualAdjustment.payload.layers[0].forecastVersion = forecastVersion;
        createManualAdjustmentLayerDataResponse = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, testdatafileCreateManualAdjustment);
        let manualadjustmentresponse = await createManualAdjustmentLayerDataResponse.json();
        let layerTypemanual = manualadjustmentresponse[0].layerType;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        let manual = false;
        for (let i = 0; i < getdemandStack.layers.length; i++) {
          if (getdemandStack.layers[i].layerType == layerTypemanual) {
            manual = true;
            break;
          }
        }
        expect(manual).toEqual(true);
      })

      await test.step("Verify if Layer Type is displayed in the Adjustment Layer list table to identify Upload", async () => {
        let downloadExcelResponse;  
        downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandStackId, forecastVersion, forecastLayerId, excelFileName, "GMV Shipped", null);     
        
        let layerIdOfUploadLayer;
        let lockDSSResponseForUploadLayer;

        lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandStackId);
        expect(lockDSSResponseForUploadLayer).toBeOK();

        let uploadLayersResponse;

        let cellsToUpdate = [
            { position: testDataFileAdjustmentUpload.cellPositionForDepartment, value: testDataFile.valueToBeUpdated }
        ];

        uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandStackId, forecastVersion, excelFileName, cellsToUpdate);

        let uploadLayersResponseBody;
        uploadLayersResponseBody = await uploadLayersResponse.json();
        
        layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
        console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);

        let layerTypeupload = uploadLayersResponseBody[0].layerType;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        let upload = false;
      
        for (let i = 0; i < getdemandStack.layers.length; i++) {
          if (getdemandStack.layers[i].layerType == layerTypeupload) {
            upload = true;
            break;
          }
        }
        expect(upload).toEqual(true);
      })

    });
  })
