import {expect, test} from '../../common/fixtures/test-hook';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify if the manage of layers is happening without recalculation", { tag: "@Regression @manageLayers @ibg-service-scenario-financials @DSS"} , () => {

    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });
    
    test("Verify if manage of layers is happening without recalculation", async ({ request }) => {
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
        let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecast);

        expect(getDemandScenarioForecastResponse).toBeOK();

        let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();
        debug.log("Get Demand Scenario Forecast initial without layers: ", JSON.stringify(getDemandScenarioForecastResponseBody));
        debug.log("Get Demand Scenario Forecast amount initial without layers: ", getDemandScenarioForecastResponseBody.forecast[1].forecast[0].amount)

        // Create 2 manual adjustment layers
        // Create first manual adjustment layer where each department inside food is made 1000
        let lockDSSDataResponseForLayer1;
        lockDSSDataResponseForLayer1 = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponseForLayer1).toBeOK();

        let createManualAdjustmentLayerDataResponseForLayer1;
        testDataFileManageRebase.payloadForManualAdjustmentLayer1.layers[0].forecastVersion = forecastVersion;
        createManualAdjustmentLayerDataResponseForLayer1 = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileManageRebase.payloadForManualAdjustmentLayer1);

        // Assertion
        expect(createManualAdjustmentLayerDataResponseForLayer1).toBeOK();

        let createManualAdjustmentLayerDataForLayer1ResponseBody = await createManualAdjustmentLayerDataResponseForLayer1.json();

        // Fetch the layerId of the first layer
        let layer1LayerId = createManualAdjustmentLayerDataForLayer1ResponseBody[0].layerId;
        debug.log("Layer 1 layer ID: ", layer1LayerId);

        // Get the demand scenario details after creating the first layer using `get-demand-scenario-forecast` api
        let getDemandScenarioForecastReponseAfterLayer1;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer1.layerIds[0] = layer1LayerId;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer1.version = forecastVersion;

        getDemandScenarioForecastReponseAfterLayer1 = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer1);
        
        let getDemandScenarioForecastReponseBodyAfterLayer1 = await getDemandScenarioForecastReponseAfterLayer1.json();
        debug.log("Get demand scenario forecast after layer 1: ", JSON.stringify(getDemandScenarioForecastReponseBodyAfterLayer1));
        debug.log("Get demand scenario forecast amount after layer 1: ", getDemandScenarioForecastReponseBodyAfterLayer1.forecast[1].forecast[0].amount);

        // Create second manual adjustment layer where food is added 12000 at the top level i.e. it becomes 24000
        let lockDSSDataResponseForLayer2;
        lockDSSDataResponseForLayer2 = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponseForLayer2).toBeOK();

        let createManualAdjustmentLayerDataResponseForLayer2;
        testDataFileManageRebase.payloadForManualAdjustmentLayer2.layers[0].forecastVersion = forecastVersion;
        createManualAdjustmentLayerDataResponseForLayer2 = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileManageRebase.payloadForManualAdjustmentLayer2);
        
        // Assertion
        expect(createManualAdjustmentLayerDataResponseForLayer2).toBeOK();

        let createManualAdjustmentLayerDataForLayer2ResponseBody = await createManualAdjustmentLayerDataResponseForLayer2.json();

        let layer2LayerId = createManualAdjustmentLayerDataForLayer2ResponseBody[0].layerId;
        debug.log("Layer 2 layer ID: ", layer2LayerId);


        // Get the demand scenario details after creating the second layer using `get-demand-scenario-forecast` api
        let getDemandScenarioForecastReponseAfterLayer2;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer2.layerIds[0] = layer2LayerId;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer2.version = forecastVersion;

        getDemandScenarioForecastReponseAfterLayer2 = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterLayer2);
        let getDemandScenarioForecastReponseBodyAfterLayer2;
        getDemandScenarioForecastReponseBodyAfterLayer2 = await getDemandScenarioForecastReponseAfterLayer2.json();
        debug.log("Get demand scenario forecast after layer 2: ", JSON.stringify(getDemandScenarioForecastReponseBodyAfterLayer2));
        debug.log("Get demand scenario forecast amount after layer 2: ", getDemandScenarioForecastReponseBodyAfterLayer2.forecast[1].forecast[0].amount);

        // Manage layers now where only the first layer is not selected and the second is selected
        // After doing this, the value generated should be equal to base layer + layer 2 value 
        let lockDSSDataResponseForManageLayers;
        lockDSSDataResponseForManageLayers = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponseForManageLayers).toBeOK();

        let manageLayersResponse;
        testDataFileManageRebase.payloadForManageLayers.layers[0].forecastVersion = forecastVersion;
        testDataFileManageRebase.payloadForManageLayers.layers[1].forecastVersion = forecastVersion;
        manageLayersResponse = await ManageRebaseUtility.manageLayers(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileManageRebase.payloadForManageLayers, layer1LayerId, layer2LayerId);
        expect(manageLayersResponse).toBeOK();

        let manageLayersResponseBody = await manageLayersResponse.json();
        debug.log("Manage Layers Response: ", JSON.stringify(manageLayersResponseBody));

        // Get the demand scenario details after creating the second layer but not selecting the first layer using `get-demand-scenario-forecast` api
        testDataFileManageRebase.payloadForGetDemandScenarioForecastWithLayers.layerIds[0] = layer2LayerId;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastWithLayers.version = forecastVersion;
        let getDemandScenarioForecastResponseAfterManageLayers = await ManageRebaseUtility.getDemandScenarioForecastWithLayerId(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileManageRebase.payloadForGetDemandScenarioForecastWithLayers);
        expect(getDemandScenarioForecastResponseAfterManageLayers).toBeOK();

        let getDemandScenarioForecastResponseBodyAfterManageLayers = await getDemandScenarioForecastResponseAfterManageLayers.json();
        debug.log("Get Demand Scenario Forecast after manage: ", JSON.stringify(getDemandScenarioForecastResponseBodyAfterManageLayers));
        debug.log("Get Demand Scenario Forecast amount after manage: ", getDemandScenarioForecastResponseBodyAfterManageLayers.forecast[1].forecast[0].amount);

        // Data validation
        expect(Math.abs(getDemandScenarioForecastResponseBody.forecast[1].forecast[0].amount-getDemandScenarioForecastResponseBodyAfterManageLayers.forecast[1].forecast[0].amount)).toBeCloseTo(Math.abs(getDemandScenarioForecastReponseBodyAfterLayer2.forecast[1].forecast[0].amount-getDemandScenarioForecastReponseBodyAfterLayer1.forecast[1].forecast[0].amount));

    })

})