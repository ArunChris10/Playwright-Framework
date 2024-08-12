import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { ManageRebaseUtility } from "../fixtures/manage-rebase-utils";
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils";
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataFile from '../testdata/adjustment-upload-aur.json';
import testDataFileAdjustmentUpload from '../testdata/adjustment-upload-layer.json';

test.describe("Verify if user is able to download the excel, update the AUR values and upload the excel", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer-upload @uploadExcelAUR" }, () => {
    let demandId;
    let excelFileName = `download_${new Date().getTime()}_data.xlsx`;
    let forecastVersion;
    let forecastLayerId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

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

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify is user can edit AUR Values by Keeping units constant using upload layer and other metrics are calculated accordingly", async ({ request }) => {
        // Get the gmv value and the net merch sales before creating the layer 
        let gmvValueBeforeLayerCreation;
        let netMerchSalesValueBeforeLayerCreation;
        let scannedUnitsValueBeforeLayerCreation;
        await test.step("Fetch the get-demand-scenario-forecast before creating layers", async () => {
            let getDemandScenarioForecastResponseBeforeLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastAur.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastAur.layerIds[0] = forecastLayerId;
            getDemandScenarioForecastResponseBeforeLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastAur);
    
            let getDemandScenarioForecastResponseBodyBeforeLayerCreation;
            getDemandScenarioForecastResponseBodyBeforeLayerCreation = await getDemandScenarioForecastResponseBeforeLayerCreation.json();
    
            getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecast.forEach(function(eachDetail) {
                if(eachDetail.department == "CANDY") {
                    gmvValueBeforeLayerCreation = eachDetail.forecast[0].amount;
                    netMerchSalesValueBeforeLayerCreation = eachDetail.forecast[0].sales;
                    scannedUnitsValueBeforeLayerCreation = eachDetail.forecast[0].units;
                }
            });
        }); 
        
        await test.step("Download the excel when the metric selected is AUR", async () => {
            let downloadExcelResponse;  
            downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, "AUR", "gmv");    
        });

        let layerIdOfUploadLayer;
        await test.step("Update the excel by changing the AUR value and upload the updated excel", async () => {
            let lockDSSResponseForUploadLayer;
            lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSResponseForUploadLayer).toBeOK();

            // Update the value of `Impact of AUR` and also the AUR value 
            let uploadLayersResponse;

            let cellsToUpdate = [
                { position: testDataFileAdjustmentUpload.cellPositionForDepartment, value: testDataFile.candyAurValueToBeUpdated },
                { position: testDataFile.positionOfImpactOfGMV, value: testDataFile.impactOfGMVForUnitsConstant }
            ];
            uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate);

            let uploadLayersResponseBody;
            uploadLayersResponseBody = await uploadLayersResponse.json();
            
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);
        });

        await test.step("Fetch the get-demand-scenario-forecast after the layer creation", async () => {
            let getDemandScenarioForecastResponseAfterLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastAur.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastAur.layerIds[0] = layerIdOfUploadLayer;
            getDemandScenarioForecastResponseAfterLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastAur);

            let getDemandScenarioForecastResponseBodyAfterLayerCreation;
            getDemandScenarioForecastResponseBodyAfterLayerCreation = await getDemandScenarioForecastResponseAfterLayerCreation.json();

            // Get the GMV, Net Merch Sales and Units value of candy
            let gmvValueAfterLayerCreation;
            let netMerchSalesValueAfterLayerCreation;
            let scannedUnitsValueAfterLayerCreation;
            let aurValueAfterLayerCreation;

            getDemandScenarioForecastResponseBodyAfterLayerCreation.forecast.forEach(function(eachDetail) {
                if(eachDetail.department == "CANDY") {
                    gmvValueAfterLayerCreation = eachDetail.forecast[0].amount;
                    netMerchSalesValueAfterLayerCreation = eachDetail.forecast[0].sales;
                    scannedUnitsValueAfterLayerCreation = eachDetail.forecast[0].units;
                    aurValueAfterLayerCreation = eachDetail.forecast[0].aur;
                }
            });

            // Validate the ratio i.e. gmv/units = aur
            expect(Math.round(gmvValueAfterLayerCreation/scannedUnitsValueAfterLayerCreation)).toEqual(aurValueAfterLayerCreation);
            
            // Validate the ratio i.e. netMerchSales/units = aur
            expect(Math.round(netMerchSalesValueAfterLayerCreation/scannedUnitsValueAfterLayerCreation)).toEqual(aurValueAfterLayerCreation);

            // Validate that scanned units is not changing
            expect(scannedUnitsValueBeforeLayerCreation).toEqual(scannedUnitsValueAfterLayerCreation);    
        });

        await test.step("Delete the upload layer before the next test starts", async () => {
            let deleteUploadLayerResponse;
            deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request, demandId, layerIdOfUploadLayer);
        });
    });

    test("Verify is user can edit AUR Values by Keeping GMV constant using upload layer and other metrics are calculated accordingly", async ({ request }) => {
        // Get the gmv value and the net merch sales before creating the layer 
        let gmvValueBeforeLayerCreation;
        let netMerchSalesValueBeforeLayerCreation;
        let scannedUnitsValueBeforeLayerCreation;
        await test.step("Fetch the get-demand-scenario-forecast before creating layers", async () => {
            let getDemandScenarioForecastResponseBeforeLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastAur.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastAur.layerIds[0] = forecastLayerId;
            getDemandScenarioForecastResponseBeforeLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastAur);
    
            let getDemandScenarioForecastResponseBodyBeforeLayerCreation;
            getDemandScenarioForecastResponseBodyBeforeLayerCreation = await getDemandScenarioForecastResponseBeforeLayerCreation.json();
    
            getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecast.forEach(function(eachDetail) {
                if(eachDetail.department == "CANDY") {
                    gmvValueBeforeLayerCreation = eachDetail.forecast[0].amount;
                    netMerchSalesValueBeforeLayerCreation = eachDetail.forecast[0].sales;
                    scannedUnitsValueBeforeLayerCreation = eachDetail.forecast[0].units;
                }
            });
        }); 
        
        await test.step("Download the excel when the metric selected is AUR", async () => {
            let downloadExcelResponse;  
            downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, "AUR", "gmv");
        });

        let layerIdOfUploadLayer;
        await test.step("Update the excel by changing the AUR value and upload the updated excel", async () => {
            let lockDSSResponseForUploadLayer;
            lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSResponseForUploadLayer).toBeOK();

            // Update the value of `Impact of AUR` and also the AUR value 
            let uploadLayersResponse;
            let cellsToUpdate = [
                { position: testDataFileAdjustmentUpload.cellPositionForDepartment, value: testDataFile.candyAurValueToBeUpdated },
                { position: testDataFile.positionOfImpactOfGMV, value: testDataFile.impactOfGMVForGMVConstant }
            ];
            uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate);

            let uploadLayersResponseBody;
            uploadLayersResponseBody = await uploadLayersResponse.json();
            
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);
        });

        await test.step("Fetch the get-demand-scenario-forecast after the layer creation", async () => {
            let getDemandScenarioForecastResponseAfterLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastAur.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastAur.layerIds[0] = layerIdOfUploadLayer;
            getDemandScenarioForecastResponseAfterLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastAur);

            let getDemandScenarioForecastResponseBodyAfterLayerCreation;
            getDemandScenarioForecastResponseBodyAfterLayerCreation = await getDemandScenarioForecastResponseAfterLayerCreation.json();

            // Get the GMV, Net Merch Sales and Units value of candy
            let gmvValueAfterLayerCreation;
            let netMerchSalesValueAfterLayerCreation;
            let scannedUnitsValueAfterLayerCreation;
            let aurValueAfterLayerCreation;

            getDemandScenarioForecastResponseBodyAfterLayerCreation.forecast.forEach(function(eachDetail) {
                if(eachDetail.department == "CANDY") {
                    gmvValueAfterLayerCreation = eachDetail.forecast[0].amount;
                    netMerchSalesValueAfterLayerCreation = eachDetail.forecast[0].sales;
                    scannedUnitsValueAfterLayerCreation = eachDetail.forecast[0].units;
                    aurValueAfterLayerCreation = eachDetail.forecast[0].aur;
                }
            });

            // Validate the ratio i.e. gmv/units = aur
            expect(Math.round(gmvValueAfterLayerCreation/scannedUnitsValueAfterLayerCreation)).toEqual(aurValueAfterLayerCreation);
            
            // Validate the ratio i.e. netMerchSales/units = aur
            expect(Math.round(netMerchSalesValueAfterLayerCreation/scannedUnitsValueAfterLayerCreation)).toEqual(aurValueAfterLayerCreation);

            // Validate that gmv is not changing
            expect(gmvValueBeforeLayerCreation).toEqual(gmvValueAfterLayerCreation);
            
            // Validate that net merch sales is not changing
            expect(netMerchSalesValueBeforeLayerCreation).toEqual(netMerchSalesValueAfterLayerCreation);
        });

        await test.step("Delete the upload layer before the next test starts", async () => {
            let deleteUploadLayerResponse;
            deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request, demandId, layerIdOfUploadLayer);
        });
    }); 

});