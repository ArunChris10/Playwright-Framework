import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import testDataFileProcessFiltersUpdateAllocation from '../testdata/process-filters-update-allocation.json';
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import debug from "debug";

test.describe("Process filters and update logic for layer creation when specific departments are selected", { tag: "@Regression @processFiltersUpdateAllocation @ibg-service-scenario-financials @Adjustment" }, () => {
    
    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });
    
    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify if the process filters and update logic for layer creation when specific departments are selected is happening properly on the SBU View", async ({ request }) => {
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
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecast.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecast.layerIds[0] = forecastLayerId;
        let getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecast);

        expect(getDemandScenarioForecastResponse).toBeOK();

        let getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();
        debug.log("Get Demand Scenario Forecast initial without layers: ", JSON.stringify(getDemandScenarioForecastResponseBody));

        // Fetch the departments selected from the payload of create manual adjustment
        let departmentsSelected = testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerSBUView.layers[0].highlighterAllocationsList[0].departmentIds;
        debug.log("Departments selected: ", departmentsSelected);

        // Calculate the sum of the values for the departments selected 
        let sumBeforeLayerForTheDepartmentsSelected = 0;
        getDemandScenarioForecastResponseBody.forecast.forEach(function(details) {
            if(departmentsSelected.includes(details.departmentId)) {
                sumBeforeLayerForTheDepartmentsSelected += details.forecast[0].amount;
            }
        });
        
        debug.log("Sum Before Layer: ", sumBeforeLayerForTheDepartmentsSelected);

        // Get the demand scenario details before creating the layers for the unselected departments
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastWithoutDepartments.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastWithoutDepartments.layerIds[0] = forecastLayerId;
        let getDemandScenarioForecastWithoutDepartmentsResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastWithoutDepartments);

        expect(getDemandScenarioForecastWithoutDepartmentsResponse).toBeOK();

        let getDemandScenarioForecastWithoutDepartmentsResponseBody = await getDemandScenarioForecastWithoutDepartmentsResponse.json();
        debug.log("Get Demand Scenario Forecast initial without the selected departments with layers: ", JSON.stringify(getDemandScenarioForecastWithoutDepartmentsResponseBody));

        // Create a manual adjustment layer where sbu is food and departments selected are Food and Service delivery
        let lockDSSDataResponseForManualAdjustmentLayer;
        lockDSSDataResponseForManualAdjustmentLayer = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponseForManualAdjustmentLayer).toBeOK();

        let createManualAdjustmentLayerSBUViewResponse;
        testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerSBUView.layers[0].forecastVersion = forecastVersion;
        createManualAdjustmentLayerSBUViewResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerSBUView);

        // Assertion
        expect(createManualAdjustmentLayerSBUViewResponse).toBeOK();

        let createManualAdjustmentLayerSBUViewResponseBody = await createManualAdjustmentLayerSBUViewResponse.json();

        // Fetch the layerId of the layer
        let layerId = createManualAdjustmentLayerSBUViewResponseBody[0].layerId;
        console.log("Layer Id: ", layerId);

        // Get the demand scenario details after creating the layers 
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecast.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecast.layerIds[0] = layerId;
        let getDemandScenarioForecastAfterLayerResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecast);

        expect(getDemandScenarioForecastAfterLayerResponse).toBeOK();

        let getDemandScenarioForecastAfterLayerResponseBody = await getDemandScenarioForecastAfterLayerResponse.json();
        debug.log("Get Demand Scenario Forecast with layers: ", JSON.stringify(getDemandScenarioForecastResponseBody));

        // Get the demand scenario details before creating the layers for the unselected departments
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastWithoutDepartments.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastWithoutDepartments.layerIds[0] = forecastLayerId;
        let getDemandScenarioForecastWithoutDepartmentsAfterLayerResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastWithoutDepartments);

        expect(getDemandScenarioForecastWithoutDepartmentsAfterLayerResponse).toBeOK();

        let getDemandScenarioForecastWithoutDepartmentsAfterLayerResponseBody = await getDemandScenarioForecastWithoutDepartmentsAfterLayerResponse.json();
        debug.log("Get Demand Scenario Forecast with layers and without the selected departments: ", JSON.stringify(getDemandScenarioForecastWithoutDepartmentsAfterLayerResponseBody));

        // Calculate the sum of the values of the departments selected after creating the layer
        let sumAfterLayerForTheDepartmentsSelected = 0; 
        getDemandScenarioForecastAfterLayerResponseBody.forecast.forEach(function(details) {
            if(departmentsSelected.includes(details.departmentId)) {
                sumAfterLayerForTheDepartmentsSelected += details.forecast[0].amount;
            }
        });
        
        debug.log("Sum After Layer: ", sumAfterLayerForTheDepartmentsSelected);

        console.log("Difference between the sums: ", Math.round(sumAfterLayerForTheDepartmentsSelected-sumBeforeLayerForTheDepartmentsSelected));

        // Validation that the difference in the sum for the departments selected is equal to the value being passed in the payload        
        expect(Math.round(sumAfterLayerForTheDepartmentsSelected-sumBeforeLayerForTheDepartmentsSelected)).toBeGreaterThanOrEqual(testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerSBUView.layers[0].highlighterAllocationsList[0].amount-1);
        expect(Math.round(sumAfterLayerForTheDepartmentsSelected-sumBeforeLayerForTheDepartmentsSelected)).toBeLessThanOrEqual(testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerSBUView.layers[0].highlighterAllocationsList[0].amount+1);

        // Validation that other departments not involved while creating layer are unaffected
        expect(getDemandScenarioForecastWithoutDepartmentsResponseBody).toEqual(getDemandScenarioForecastWithoutDepartmentsAfterLayerResponseBody);

        // Delete the manual adjustment layer
        let deleteManualAdjustmentLayer = await DemandBaseClass.deleteManualAdjustmentLayer(request, demandId, layerId);
    });

    test("Verify if the process filters and update logic for layer creation when specific departments are selected is happening properly on the Channel View", async ({ request }) => {
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

        // Get the demand scenario forecast before creating layers for the 2 SBU's selected 
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelView.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelView.layerIds[0] = forecastLayerId;
        let getDemandScenarioForecastForFoodAndConsumablesResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelView);

        expect(getDemandScenarioForecastForFoodAndConsumablesResponse).toBeOK();

        let getDemandScenarioForecastForFoodAndConsumablesResponseBody = await getDemandScenarioForecastForFoodAndConsumablesResponse.json();
        debug.log("Get Demand Scenario Forecast initial without layers for the selected SBU's: ", JSON.stringify(getDemandScenarioForecastForFoodAndConsumablesResponseBody));
        
        let departmentIdsSelected = testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerChannelView.layers[0].highlighterAllocationsList[0].departmentIds;

        // Calculate the sum of all the sbus 
        let sumOfSelectedDepartmentsBeforeLayer = 0;
        getDemandScenarioForecastForFoodAndConsumablesResponseBody.forecast.forEach(function(details) {
            if(departmentIdsSelected.includes(details.departmentId)) {
                sumOfSelectedDepartmentsBeforeLayer += details.forecast[0].amount;
            }
        });

        debug.log("sumOfSelectedDepartmentsBeforeLayer: ", sumOfSelectedDepartmentsBeforeLayer);

        // Get the demand scenario forecast before creating layers for the remaining SBU's
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelViewOtherSBUs.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelViewOtherSBUs.layerIds[0] = forecastLayerId;
        let getDemandScenarioForecastForOtherSBUsResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelViewOtherSBUs);

        expect(getDemandScenarioForecastForOtherSBUsResponse).toBeOK();

        let getDemandScenarioForecastForOtherSBUsResponseBody = await getDemandScenarioForecastForOtherSBUsResponse.json();
        debug.log("Get Demand Scenario Forecast with layers for the remaining SBU: ", JSON.stringify(getDemandScenarioForecastForOtherSBUsResponseBody));

        // Create manual adjustment layer changing specific SBU's i.e. specific departments 
        let lockDSSDataResponseForManualAdjustmentLayer;
        lockDSSDataResponseForManualAdjustmentLayer = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponseForManualAdjustmentLayer).toBeOK();

        let createManualAdjustmentLayerDataResponseForManualAdjustmentLayer;
        testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerChannelView.layers[0].forecastVersion = forecastVersion;
        createManualAdjustmentLayerDataResponseForManualAdjustmentLayer = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerChannelView);

        // Assertion
        expect(createManualAdjustmentLayerDataResponseForManualAdjustmentLayer).toBeOK();

        let createManualAdjustmentLayerDataResponseBodyForManualAdjustmentLayer = await createManualAdjustmentLayerDataResponseForManualAdjustmentLayer.json();

        // Fetch the layerId of the layer
        let layerId = createManualAdjustmentLayerDataResponseBodyForManualAdjustmentLayer[0].layerId;
        console.log("Layer Id: ", layerId);

        // Get the demand scenario forecast value after creating layer for the selected SBU's
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelView.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelView.layerIds[0] = layerId;
        let getDemandScenarioForecastForFoodAndConsumablesAfterLayerResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelView);

        expect(getDemandScenarioForecastForFoodAndConsumablesAfterLayerResponse).toBeOK();

        let getDemandScenarioForecastForFoodAndConsumablesAfterLayerResponseBody = await getDemandScenarioForecastForFoodAndConsumablesAfterLayerResponse.json();
        debug.log("Get Demand Scenario Forecast after layer for the selected SBU's: ", JSON.stringify(getDemandScenarioForecastForFoodAndConsumablesAfterLayerResponseBody));

        // Calculate the sum of all the department values after creating the layer
        let sumOfSelectedDepartmentsAfterLayer = 0;
        getDemandScenarioForecastForFoodAndConsumablesAfterLayerResponseBody.forecast.forEach(function(details) {
            if(departmentIdsSelected.includes(details.departmentId)) {
                sumOfSelectedDepartmentsAfterLayer += details.forecast[0].amount;
            }
        });

        debug.log("sumOfSelectedDepartmentsAfterLayer: ", sumOfSelectedDepartmentsAfterLayer);

        // Get the demand scenario forecast for the all the remaining SBU's
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelViewOtherSBUs.version = forecastVersion;
        testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelViewOtherSBUs.layerIds[0] = layerId;
        let getDemandScenarioForecastForOtherSBUsAfterLayerResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFileProcessFiltersUpdateAllocation.payloadForGetDemandScenarioForecastChannelViewOtherSBUs);

        expect(getDemandScenarioForecastForOtherSBUsAfterLayerResponse).toBeOK();

        let getDemandScenarioForecastForOtherSBUsAfterLayerResponseBody = await getDemandScenarioForecastForOtherSBUsAfterLayerResponse.json();
        debug.log("Get Demand Scenario Forecast with layer for the remaining SBU's: ", JSON.stringify(getDemandScenarioForecastForOtherSBUsAfterLayerResponseBody));

        console.log("Difference between the sums: ", Math.round(sumOfSelectedDepartmentsAfterLayer-sumOfSelectedDepartmentsBeforeLayer));

        // Validation that the difference in the sum for the departments selected is equal to the value being passed in the payload
        expect(Math.round(sumOfSelectedDepartmentsAfterLayer-sumOfSelectedDepartmentsBeforeLayer)).toBeGreaterThanOrEqual(testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerChannelView.layers[0].highlighterAllocationsList[0].amount-1);
        expect(Math.round(sumOfSelectedDepartmentsAfterLayer-sumOfSelectedDepartmentsBeforeLayer)).toBeLessThanOrEqual(testDataFileProcessFiltersUpdateAllocation.payloadForManualAdjustmentLayerChannelView.layers[0].highlighterAllocationsList[0].amount+1);

        // Validation that other departments not involved while creating layer are unaffected
        expect(getDemandScenarioForecastForOtherSBUsResponseBody).toEqual(getDemandScenarioForecastForOtherSBUsAfterLayerResponseBody);
    });
});