import {expect, test} from '../../common/fixtures/test-hook';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify if the rebase of the base forecast is happening without recalculation", { tag: "@Smoke @Regression @rebaseBaseForecast @ibg-service-scenario-financials @DSS"} , () => {

    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify if the rebase of base forecast is happening without recalculation", async ({ request }) => {
        // Get the forecast version of the DSS created
        let forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
        console.log("Forecast Version: ", forecastVersion);

        let forecastInfoResponse;
        forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);

        let forecastInfoResponseBody;
        forecastInfoResponseBody = await forecastInfoResponse.json();

        // Fetch the layerId for the forecast version of the DSS created 
        let forecastLayerId;
        forecastInfoResponseBody.forEach(function(forecastInfo) {
            if(forecastInfo.version == forecastVersion) {
                forecastLayerId = forecastInfo.forecastLayerId;
            }
        });

        // Get the demand scenario details before creating the layers using `get-demand-scenario-forecast` api
        testDataFileManageRebase.payloadForGetDemandScenarioForecast.version = forecastVersion;
        testDataFileManageRebase.payloadForGetDemandScenarioForecast.layerIds[0] = forecastLayerId;

        let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecastWithLayerId(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecast);

        expect(getDemandScenarioForecastResponse).toBeOK();

        let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();
        debug.log("Get Demand Scenario Forecast: ", JSON.stringify(getDemandScenarioForecastResponseBody));
        debug.log("Get Demand Scenario Forecast Amount: ", getDemandScenarioForecastResponseBody.forecast[1].forecast[0].amount);

        // Create a manual adjustment layer
        let lockDSSDataResponseForLayer1;
        lockDSSDataResponseForLayer1 = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponseForLayer1).toBeOK();

        let createManualAdjustmentLayerResponse;
        testDataFileManageRebase.payloadForCreateManualAdjustmentLayerRebase.layers[0].forecastVersion = forecastVersion
        createManualAdjustmentLayerResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileManageRebase.payloadForCreateManualAdjustmentLayerRebase);

        // Assertion 
        expect(createManualAdjustmentLayerResponse).toBeOK();

        let createManualAdjustmentLayerResponseBody = await createManualAdjustmentLayerResponse.json();
        debug.log("createManualAdjustmentLayerResponseBody: ", JSON.stringify(createManualAdjustmentLayerResponseBody));

        // Store the layerId of the new layer created
        let layerId = createManualAdjustmentLayerResponseBody[0].layerId;
        debug.log("Layer Id: ", layerId);

        // Get the demand scenario details before creating the layer using `get-demand-scenario-forecast` api
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer1.version = forecastVersion;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer1.layerIds[0] = layerId;

        let getDemandScenarioForecastResponseAfterLayer1;
        getDemandScenarioForecastResponseAfterLayer1 = await ManageRebaseUtility.getDemandScenarioForecastWithLayerId(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer1);

        let getDemandScenarioForecastResponseBodyAfterLayer1;
        getDemandScenarioForecastResponseBodyAfterLayer1 = await getDemandScenarioForecastResponseAfterLayer1.json();
        debug.log("Get Demand Scenario Forecast After Layer 1: ", JSON.stringify(getDemandScenarioForecastResponseBody));
        debug.log("Get Demand Scenario Forecast Amount After Layer 1: ", getDemandScenarioForecastResponseBodyAfterLayer1.forecast[1].forecast[0].amount);

        // Change the Base Demand Stack Forecast 
        let switchBaseDSResponse;

        // Before switching forecast, fetch the forecast version of the new demand stack forecast and store it
        let forecastVersionForSwitchDS;
        if(forecastVersion == forecastInfoResponseBody[0].version) {
            forecastVersionForSwitchDS = forecastInfoResponseBody[1].version;
        } else {
            forecastVersionForSwitchDS = forecastInfoResponseBody[0].version;
        }

        // Get the layerId of the forecast version of the new demand stack forecast
        let forecastLayerIdAfterRebase;
        forecastInfoResponseBody.forEach(function(forecastInfo) {
            if(forecastInfo.version == forecastVersionForSwitchDS) {
                forecastLayerIdAfterRebase = forecastInfo.forecastLayerId;
            }
        });

        debug.log("Forecast version for Switch DS: ", forecastVersionForSwitchDS);

        switchBaseDSResponse = await ManageRebaseUtility.switchBaseDSResponse(request, demandId, forecastVersionForSwitchDS);

        // Wait until the job is completed
        let jobCompletionStatus;
        jobCompletionStatus = await CdfUtility.checkClonedJobStatus(request, demandId);
        debug.log("Job is completed");

        // Get the demand scenario details after rebase using `get-demand-scenario-forecast` api
        let getDemandScenarioForecastResponseAfterRebase;

        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase.version = forecastVersionForSwitchDS;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase.layerIds[0] = forecastLayerIdAfterRebase;

        getDemandScenarioForecastResponseAfterRebase = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase)

        expect(getDemandScenarioForecastResponseAfterRebase).toBeOK();

        let getDemandScenarioForecastResponseBodyAfterRebase = await getDemandScenarioForecastResponseAfterRebase.json();
        debug.log("getDemandScenarioForecastResponseBody: ", JSON.stringify(getDemandScenarioForecastResponseBodyAfterRebase));
        debug.log("Get Demand Scenario Forecast Amount After Base Forecast change: ", getDemandScenarioForecastResponseBodyAfterRebase.forecast[1].forecast[0].amount);

        // Get the demand scenario details after rebase with layer using `get-demand-scenario-forecast` api 
        let getDemandScenarioForecastResponseForLayer;

        testDataFileManageRebase.payloadForGetDemandScenarioForecastAdjustmentLayer.layerIds[0] = layerId
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAdjustmentLayer.version = forecastVersionForSwitchDS;

        getDemandScenarioForecastResponseForLayer = await ManageRebaseUtility.getDemandScenarioForecastWithLayerId(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecastAdjustmentLayer);

        let getDemandScenarioForecastResponseBodyForLayer;
        getDemandScenarioForecastResponseBodyForLayer = await getDemandScenarioForecastResponseForLayer.json();
        debug.log("getDemandScenarioForecastResponseBodyForLayer: ", JSON.stringify(getDemandScenarioForecastResponseBodyForLayer));
        debug.log("Get Demand Scenario Forecast Amount After Base Forecast change with layer: ", getDemandScenarioForecastResponseBodyForLayer.forecast[1].forecast[0].amount);

        // Assertion and data validation
        expect(Math.abs(Math.round(getDemandScenarioForecastResponseBody.forecast[1].forecast[0].amount)-Math.round(getDemandScenarioForecastResponseBodyAfterLayer1.forecast[1].forecast[0].amount))).toEqual(Math.abs(Math.round(getDemandScenarioForecastResponseBodyAfterRebase.forecast[1].forecast[0].amount)-Math.round(getDemandScenarioForecastResponseBodyForLayer.forecast[1].forecast[0].amount)));
    })

});