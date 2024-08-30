import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from '../fixtures/cdf-utils';

import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';

import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';

import adjustmentData from '../testdata/adjustment-manual-metrics-data.json';

import emtData from '../testdata/emt-layer-data-transfer.json';

import { AdjustmentUploadLayer } from '../fixtures/adjustment-upload-layer-utils';


test.describe("Verify user is able to edit adjustment manual metrics", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    
    let demandId;
    let forecastVersion;
    let beforeEditDataforMonthSbu1;
    let beforeEditDataforMonthSbu2;
    let beforeEditDataforMonthChannel1;
    let beforeEditDataforMonthChannel2;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.beforeAll(async ({ request }) => {
        forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
        console.log("Forecast Version: ", forecastVersion);

        let payload = adjustmentData.sbuleveldata.payload
        payload.version = forecastVersion
        payload.timeFilter.filterLevel= "MONTH";
        
        let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);

        let getDemandScenarioForecastResponseBody;
        getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

        beforeEditDataforMonthSbu1  = getDemandScenarioForecastResponseBody.forecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026 && c.month == 8).map(c => c.amount)[0];
        beforeEditDataforMonthSbu2  = getDemandScenarioForecastResponseBody.forecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026 && c.month == 9).map(c => c.amount)[0];
        
        let payloadChannel = adjustmentData.channelleveldata.payload
        payloadChannel.version = forecastVersion
        payloadChannel.timeFilter.filterLevel= "MONTH";

        getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payloadChannel);
        getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();
        
        beforeEditDataforMonthChannel1  = getDemandScenarioForecastResponseBody.forecast.filter(c => c.baseChannel == 'DSV_S2S')[0].forecast.filter(c => c.year == 2026 && c.month == 8).map(c => c.amount)[0];
        beforeEditDataforMonthChannel2  = getDemandScenarioForecastResponseBody.forecast.filter(c => c.baseChannel == 'DSV_S2S')[0].forecast.filter(c => c.year == 2026 && c.month == 9).map(c => c.amount)[0];
    })

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });


    test("Verify user edit gmv shipped for sbu level data transfer", async ({ request }) => {         
       
        let layerIdOfUploadLayer;
        
        await test.step("lock scenario ", async () => {  
            let lockResponse = await LockUnlockUtility.lockDSSData(request, demandId); 
            expect(lockResponse).toBeOK();
        }); 
        
        await test.step("create an emt layer", async () => {
            let payload  = emtData.sbutransfer
            payload.layers[0].forecastVersion = forecastVersion;
            let getuploadLayersResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, emtData.sbutransfer.baseURL, payload);
            let uploadLayersResponseBody = await getuploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the adjustment layer:", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the sbu that was changed", async () => {
            let payload = adjustmentData.sbuleveldata.payload
            payload.layerIds = [layerIdOfUploadLayer];
            payload.version = forecastVersion;
            payload.timeFilter.filterLevel= "MONTH";
            let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);
            let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            let afterEditDataformonth1  = getDemandScenarioForecastResponseBody.forecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026 && c.month == 8).map(c => c.amount)[0];
            let afterEditDataformonth2= getDemandScenarioForecastResponseBody.forecast.filter(c => c.sbu == 'FOOD')[0].forecast.filter(c => c.year == 2026 && c.month == 9).map(c => c.amount)[0];
    
            expect((afterEditDataformonth2/afterEditDataformonth1).toFixed(2)).toEqual((beforeEditDataforMonthSbu2/beforeEditDataforMonthSbu1).toFixed(2));
        });

        await test.step("delete the layer", async () => {
            let deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request,demandId,layerIdOfUploadLayer)
            expect(deleteUploadLayerResponse).toBeOK();
        })
    });
    
    test("Verify user edit gmv shipped for channel level data transfer", async ({ request }) => {         
       
        let layerIdOfUploadLayer;
        
        await test.step("lock scenario ", async () => {  
            let lockResponse = await LockUnlockUtility.lockDSSData(request, demandId); 
            expect(lockResponse).toBeOK();
        }); 
        
        await test.step("create an emt layer", async () => {
            let payload  = emtData.channelstransfer
            payload.layers[0].forecastVersion = forecastVersion;
            let getuploadLayersResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, emtData.channelstransfer.baseURL, payload);
            let uploadLayersResponseBody = await getuploadLayersResponse.json();
    
            layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
            console.log("Layer Id of the adjustment layer:", layerIdOfUploadLayer);
        }); 

        await test.step("Get the demand scenario forecast after creating the layer and validate the channel that was changed", async () => {
            let payload = adjustmentData.channelleveldata.payload
            payload.layerIds = [layerIdOfUploadLayer];
            payload.version = forecastVersion;
            payload.timeFilter.filterLevel= "MONTH";
            payload.organizationalLevel = 'BASE_CHANNEL'
            let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, adjustmentData.sbuleveldata.baseURL, payload);
            let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            let afterEditDataformonth1  = getDemandScenarioForecastResponseBody.forecast.filter(c => c.baseChannel == 'DSV_S2S')[0].forecast.filter(c => c.year == 2026 && c.month == 8).map(c => c.amount)[0];
            let afterEditDataformonth2= getDemandScenarioForecastResponseBody.forecast.filter(c => c.baseChannel == 'DSV_S2S')[0].forecast.filter(c => c.year == 2026 && c.month == 9).map(c => c.amount)[0];
            expect((afterEditDataformonth2/beforeEditDataforMonthChannel2).toFixed(2)).toEqual((afterEditDataformonth1/beforeEditDataforMonthChannel1).toFixed(2));
        });

        await test.step("delete the layer", async () => {
            let deleteUploadLayerResponse = await AdjustmentUploadLayer.deleteUploadLayer(request,demandId,layerIdOfUploadLayer)
            expect(deleteUploadLayerResponse).toBeOK();
        })
    });
   

});