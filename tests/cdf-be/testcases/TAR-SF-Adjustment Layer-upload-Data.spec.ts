import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from '../fixtures/cdf-utils';
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils";
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import testDataFile from '../testdata/adjustment-upload-layer.json';

test.describe("Verify user is able to download excel, update the values and upload the excel", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer-upload @uploadExcel" }, () => {
    
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

    test("Verify user can Upload the downloaded excel template with modified values", async ({ request }) => {    
        await test.step("Download the excel", async () => {
            let downloadExcelResponse;
            downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, "GMV Shipped", null);
        });
    
        await test.step("Lock the demand stack before creating an upload layer", async () => {
            let lockDSSResponseForUploadLayer;
            lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSResponseForUploadLayer).toBeOK();
        });
        
        let layerIdOfUploadLayer;
        await test.step("Update the value in excel and create an upload layer", async () => {
            let uploadLayersResponse;
            let cellsToUpdate = [
                { position : testDataFile.cellPositionForDepartment, value: testDataFile.valueToBeUpdated }
            ];
            uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate);
            
            let uploadLayersResponseBody;
            uploadLayersResponseBody = await uploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);

            // Validate if the layer has been created 
            expect(uploadLayersResponse).toBeOK();
        }); 

        await test.step("Delete the upload layer before the next test starts", async () => {
            let deleteUploadLayerResponse;
            deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request, demandId, layerIdOfUploadLayer);
        });

    });

    test("Verify user edit only on department level , values entered on SBU and Channel Levels are ignored", async ({ request }) => {        
        await test.step("Download the excel", async () => {
            let downloadExcelResponse;
            downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, "GMV Shipped", null);
        });
    
        await test.step("Lock the demand stack before creating an upload layer", async () => {
            let lockDSSResponseForUploadLayer;
            lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSResponseForUploadLayer).toBeOK();
        });
        
        let layerIdOfUploadLayer;
        await test.step("Update the value in excel and create an upload layer", async () => {
            let uploadLayersResponse;
            let cellsToUpdate = [
                { position: testDataFile.cellPositionForDepartment, value: testDataFile.valueToBeUpdated },
                { position: testDataFile.cellPositionForSBU, value: testDataFile.valueToBeUpdated },
                { position: testDataFile.cellPositionForChannel, value: testDataFile.valueToBeUpdated }
            ];
            uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate);
            
            let uploadLayersResponseBody;
            uploadLayersResponseBody = await uploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the department that was changed", async () => {
            testDataFile.payloadForGetDemandScenarioForecast.layerIds[0] = layerIdOfUploadLayer;
            testDataFile.payloadForGetDemandScenarioForecast.version = forecastVersion;
            let getDemandScenarioForecastResponse;
            getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecast);

            let getDemandScenarioForecastResponseBody;
            getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();
            let candyValue;
            getDemandScenarioForecastResponseBody.forecast.forEach(function(eachDetail) {
                if(eachDetail.department == "CANDY") {
                    candyValue = eachDetail.forecast[0].amount;
                }
            });

            console.log("Candy Value: ", candyValue);
            expect(candyValue).toEqual(testDataFile.valueToBeUpdated);
        });

        await test.step("Get the demand scenario forecast after creating the layers and validate that sbu has not changed", async () => {
            testDataFile.payloadForGetDemandScenarioForecastSBULevel.layerIds[0] = layerIdOfUploadLayer;
            testDataFile.payloadForGetDemandScenarioForecastSBULevel.version = forecastVersion;
            let getDemandScenarioForecastResponseForSBULevel;
            getDemandScenarioForecastResponseForSBULevel = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastSBULevel);

            let getDemandScenarioForecastResponseBodyForSBULevel;
            getDemandScenarioForecastResponseBodyForSBULevel = await getDemandScenarioForecastResponseForSBULevel.json();

            let foodValue;
            getDemandScenarioForecastResponseBodyForSBULevel.forecast.forEach(function(eachDetail) {
                if(eachDetail.sbu == "FOOD") {
                    foodValue = eachDetail.forecast[0].amount;
                }
            });
            
            // Validate that SBU level data has not been updated to the cell value of excel
            expect(foodValue).not.toEqual(testDataFile.valueToBeUpdated);
        });

        await test.step("Get the demand scenario forecast after creating the layers and validate that channel has not changed", async () => {
            testDataFile.payloadForGetDemandScenarioForecastChannelLevel.layerIds[0] = layerIdOfUploadLayer;
            testDataFile.payloadForGetDemandScenarioForecastChannelLevel.version = forecastVersion;
            let getDemandScenarioForecastResponseForChannelLevel;
            getDemandScenarioForecastResponseForChannelLevel = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastChannelLevel);

            let getDemandScenarioForecastResponseBodyForChannelLevel;
            getDemandScenarioForecastResponseBodyForChannelLevel = await getDemandScenarioForecastResponseForChannelLevel.json();

            // Validate that Channel level value has not been updated to the cell value of excel
            expect(getDemandScenarioForecastResponseBodyForChannelLevel.forecast[0].forecast[0].amount).not.toEqual(testDataFile.valueToBeUpdated);
        });

        await test.step("Delete the upload layer before the next test starts", async () => {
            let deleteUploadLayerResponse;
            deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request, demandId, layerIdOfUploadLayer);
        });
    });

    test("Verify if the edited department values in the excel file is matching in demand output table after upload", async ({ request }) => {
        await test.step("Download the excel", async () => {
            let downloadExcelResponse;
            downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, "GMV Shipped", null);
        });
    
        await test.step("Lock the demand stack before creating an upload layer", async () => {
            let lockDSSResponseForUploadLayer;
            lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSResponseForUploadLayer).toBeOK();
        });
        
        let layerIdOfUploadLayer;
        await test.step("Update the value in excel and create an upload layer", async () => {
            let uploadLayersResponse;

            let cellsToUpdate = [
                { position : testDataFile.cellPositionForDepartment, value: testDataFile.valueToBeUpdated }
            ];

            uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate);
            
            let uploadLayersResponseBody;
            uploadLayersResponseBody = await uploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the department that was changed", async () => {
            testDataFile.payloadForGetDemandScenarioForecast.layerIds[0] = layerIdOfUploadLayer;
            testDataFile.payloadForGetDemandScenarioForecast.version = forecastVersion;
            let getDemandScenarioForecastResponse;
            getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecast);

            let getDemandScenarioForecastResponseBody;
            getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();
            let candyValue;
            getDemandScenarioForecastResponseBody.forecast.forEach(function(eachDetail) {
                if(eachDetail.department == "CANDY") {
                    candyValue = eachDetail.forecast[0].amount;
                }
            });

            console.log("Candy Value: ", candyValue);
            expect(candyValue).toEqual(testDataFile.valueToBeUpdated);
        });

        await test.step("Delete the upload layer before the next test starts", async () => {
            let deleteUploadLayerResponse;
            deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request, demandId, layerIdOfUploadLayer);
        });
    });

});