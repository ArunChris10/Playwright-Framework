import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from '../fixtures/cdf-utils';

import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';

import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';

import adjustmentData from '../testdata/adjustment-manual-metrics-data.json';

import { AdjustmentUploadLayer } from '../fixtures/adjustment-upload-layer-utils';


test.describe("Verify user is able to edit adjustment manual metrics", { tag: "@Regression @ibg-service-scenario-financials @Adjustment-Manual" }, () => {
    
    let demandId;
    let forecastVersion;
    let beforeEditData;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.beforeAll(async ({ request }) => {
        forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
        console.log("Forecast Version: ", forecastVersion);
        let payload = adjustmentData.sbuleveldata.payload
        payload.version = forecastVersion

        let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);

        let getDemandScenarioForecastResponseBody;
        getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

        beforeEditData  = getDemandScenarioForecastResponseBody.yearlyForecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026).map(c => c)[0];
   
    })

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });


    test("Verify user edit gmv shipped", async ({ request }) => {         
       
        let layerIdOfUploadLayer;
        
        await test.step("lock scenario ", async () => {  
            let lockResponse = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockResponse).toBeOK();
        }); 
        
        await test.step("create an adjsument layer", async () => {
            let payload  = adjustmentData.uploadadjustmentLayers.payload
            payload.layers[0].forecastVersion = forecastVersion;
            payload.layers[0].allocationType = 'DOLLAR';
            let getuploadLayersResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, adjustmentData.uploadadjustmentLayers.baseURL, payload);
            let uploadLayersResponseBody = await getuploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the adjustment layer:", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the sbu that was changed", async () => {
            let payload = adjustmentData.sbuleveldata.payload
            payload.layerIds = [layerIdOfUploadLayer];
            payload.version = forecastVersion;
            let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);
            let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            let afterEditData  =getDemandScenarioForecastResponseBody.yearlyForecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026).map(c => c.amount)[0];
            expect(beforeEditData.amount).not.toEqual(afterEditData)
        });

        await test.step("delete the layer", async () => {
            let deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request,demandId,layerIdOfUploadLayer)
            expect(deleteUploadLayerResponse).toBeOK();
        })
    });

    test("Verify user edit Net Merch Sales ", async ({ request }) => {         
       
        let layerIdOfUploadLayer;

        await test.step("lock scenario ", async () => {  
            let lockResponse = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockResponse).toBeOK();
        }); 

        await test.step("create an adjsument layer", async () => {
            let payload  = adjustmentData.uploadadjustmentLayers.payload
            payload.layers[0].forecastVersion = forecastVersion;
            payload.layers[0].allocationType = 'CONVERTED_SALE';
            let getuploadLayersResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, adjustmentData.uploadadjustmentLayers.baseURL, payload);

            let uploadLayersResponseBody = await getuploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the adjustment layer: ", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the sbu that was changed", async () => {
            let payload = adjustmentData.sbuleveldata.payload
            payload.layerIds = [layerIdOfUploadLayer];
            payload.version = forecastVersion;
            let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);

            let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            let afterEditData  =getDemandScenarioForecastResponseBody.yearlyForecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026).map(c => c.sales)[0];
            expect(beforeEditData.sales).not.toEqual(afterEditData)
        });

        await test.step("delete the layer", async () => {
            let deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request,demandId,layerIdOfUploadLayer)
            expect(deleteUploadLayerResponse).toBeOK();
        })
    });

    test("Verify user edit Scanned Units  ", async ({ request }) => {         
       
        let layerIdOfUploadLayer;

        await test.step("lock scenario ", async () => {  
            let lockResponse = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockResponse).toBeOK();
        }); 

        await test.step("create an adjsument layer", async () => {
            let payload  = adjustmentData.uploadadjustmentLayers.payload
            payload.layers[0].forecastVersion = forecastVersion;
            payload.layers[0].allocationType = 'UNIT';
            let getuploadLayersResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, adjustmentData.uploadadjustmentLayers.baseURL, payload);

            let uploadLayersResponseBody = await getuploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the adjustment layer: ", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the sbu that was changed", async () => {
            let payload = adjustmentData.sbuleveldata.payload
            payload.layerIds = [layerIdOfUploadLayer];
            payload.version = forecastVersion;
            let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);

            let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            let afterEditData  = getDemandScenarioForecastResponseBody.yearlyForecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026).map(c => c.units)[0];
            expect(beforeEditData.units).not.toEqual(afterEditData)
        });

        await test.step("delete the layer", async () => {
            let deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request,demandId,layerIdOfUploadLayer)
            expect(deleteUploadLayerResponse).toBeOK();
        })
    });
});