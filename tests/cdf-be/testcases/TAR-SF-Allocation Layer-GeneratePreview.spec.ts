import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataFileAllocationLayerGeneratePreview from '../testdata/allocation-layer-generate-preview.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import debug from 'debug';

test.describe("Verify user Preview numbers need not be saved. Its just displayed on screen and it gets saved only if user saves it", { tag: "@Regression @ibg-service-scenario-financials @Allocation Layer @allocationLayerGeneratePreview" }, () => {
    
    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify user Preview numbers need not be saved. Its just displayed on screen and it gets saved only if user saves it", async ({ request }) => {
        
        let forecastVersion;
        
        let forecastInfoResponse;
        
        let forecastInfoResponseBody;
        
        let forecastLayerId;
        
        await test.step("Fetch the forecast version for the demand stack", async () => {
            forecastVersion = await CdfUtility.getDemandScenarioList(request);
            forecastVersion = forecastVersion.version;
            console.log("Forecast Version: ", forecastVersion);

            forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);
            forecastInfoResponseBody = await forecastInfoResponse.json();

            // Fetch the layerId for the forecast version of the DSS created
            forecastInfoResponseBody.forEach(function(forecastInfo) {
                if(forecastInfo.version == forecastVersion) {
                    forecastLayerId = forecastInfo.forecastLayerId;
                }
            });
        });

        let getDemandScenarioForecastResponse;
        
        let getDemandScenarioForecastResponseBody;

        let sellerFulfilledValue;
        let walmartFulfillmentServicesValue;
        
        await test.step("Fetch the get-demand-scenario-forecast initially", async () => {
            testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecast.version = forecastVersion;
            testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecast.layerIds[0] = forecastLayerId;
            getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecast);

            getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            if(getDemandScenarioForecastResponseBody.forecast[0].baseChannel == "SELLER_FULFILLED") {
                sellerFulfilledValue = getDemandScenarioForecastResponseBody.forecast[0].forecast[0].amount;
                walmartFulfillmentServicesValue = getDemandScenarioForecastResponseBody.forecast[1].forecast[0].amount;
            } else {
                sellerFulfilledValue = getDemandScenarioForecastResponseBody.forecast[1].forecast[0].amount;
                walmartFulfillmentServicesValue = getDemandScenarioForecastResponseBody.forecast[0].forecast[0].amount;
            }
            debug.log("Get Demand Scenario Forecast initial without layers: ", JSON.stringify(getDemandScenarioForecastResponseBody));
        });

        let createAllocationLayerDataResponseForAllocationLayer;

        let createAllocationLayerDataResponseBodyForAllocationLayer;

        let layerId;

        await test.step("Create allocation layer and click on preview", async () => {
            // Lock the demand stack scenario
            let lockDSSDataResponseForAllocationLayer;
            lockDSSDataResponseForAllocationLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSDataResponseForAllocationLayer).toBeOK();

            // Create allocation layer
            testDataFileAllocationLayerGeneratePreview.payloadForCreatingAllocationLayer.layers[0].forecastVersion = forecastVersion;
            testDataFileAllocationLayerGeneratePreview.payloadForCreatingAllocationLayer.layers[0].monthlySplitsRequest['2027-05'][0].amount = sellerFulfilledValue+100000000;
            testDataFileAllocationLayerGeneratePreview.payloadForCreatingAllocationLayer.layers[0].monthlySplitsRequest['2027-05'][1].amount = (walmartFulfillmentServicesValue-100000000).toString();

            createAllocationLayerDataResponseForAllocationLayer = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileAllocationLayerGeneratePreview.payloadForCreatingAllocationLayer);

            // Assertion
            expect(createAllocationLayerDataResponseForAllocationLayer).toBeOK();

            createAllocationLayerDataResponseBodyForAllocationLayer = await createAllocationLayerDataResponseForAllocationLayer.json();
            layerId = createAllocationLayerDataResponseBodyForAllocationLayer[0].layerId;
            debug.log("Layer Id of allocation layer: ", layerId);
        });

        let getDemandScenarioForecastResponseAfterAllocation;

        let getDemandScenarioForecastAfterAllocationResponseBody;

        await test.step("Get demand scenario forecast after generate Preview", async () => {
            testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecastWithAllocationLayer.version = forecastVersion;
            testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecastWithAllocationLayer.layerIds[0] = layerId;
            getDemandScenarioForecastResponseAfterAllocation = await ManageRebaseUtility.getDemandScenarioForecastWithLayerId(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecastWithAllocationLayer);

            getDemandScenarioForecastAfterAllocationResponseBody = await getDemandScenarioForecastResponseAfterAllocation.json();
            debug.log("Get Demand Scenario Forecast initial with Allocation Layer: ", JSON.stringify(getDemandScenarioForecastAfterAllocationResponseBody));

            // Check 
            expect(getDemandScenarioForecastResponseBody).not.toEqual(getDemandScenarioForecastAfterAllocationResponseBody);
        });

        let getDemandScenarioForecastResponseAfterAllocationLayer;

        let getDemandScenarioForecastResponseBodyAfterAllocationLayer;

        await test.step("Get demand scenario forecast without layers and validate", async () => {
            testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecast.version = forecastVersion;
            testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecast.layerIds[0] = forecastLayerId;

            getDemandScenarioForecastResponseAfterAllocationLayer = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileAllocationLayerGeneratePreview.payloadForGetDemandScenarioForecast);

            expect(getDemandScenarioForecastResponseAfterAllocationLayer).toBeOK();

            getDemandScenarioForecastResponseBodyAfterAllocationLayer = await getDemandScenarioForecastResponse.json();
            debug.log("Get Demand Scenario Forecast initial after layers: ", JSON.stringify(getDemandScenarioForecastResponseBodyAfterAllocationLayer));

            // Check
            expect(getDemandScenarioForecastResponseBody).toEqual(getDemandScenarioForecastResponseBodyAfterAllocationLayer);
        });

    });

});