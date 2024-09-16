import { test, expect } from '../../common/fixtures/test-hook';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileCreateManualAdjustment from '../testdata/create-manual-adjustment-layer.json';
import testdatafileEditManualAdjustment from '../testdata/edit-manual-adjustment-layer.json';
import testdatafileGetManualAdjustment from '../testdata/get-manual-adjustment-layer.json';
import testdatafileDeleteManualAdjustment from '../testdata/delete-manual-adjustment-layer.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify user can create/edit/delete an Manual Adjustment layer", { tag: "@Smoke @manualAdjustmentLayer @ibg-service-scenario-financials @Regression"}, () => {
    let layerId;
    let demandId;
    let forecastVersion;
    let userID = process.env.cdfUser;

    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ request }) => {
         demandId = await CdfUtility.createScenario(request);
         forecastVersion = await CdfUtility.getDemandScenarioList(request);
         forecastVersion = forecastVersion.version;
         console.log("Forecast Version: ", forecastVersion)
        
        });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify user is able to create a Manual Adjustment Layer", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
        testdatafileCreateManualAdjustment.payload.layers[0].forecastVersion = forecastVersion
        testdatafileCreateManualAdjustment.expected_response[0].forecastVersion = forecastVersion
        testdatafileCreateManualAdjustment.expected_response[0].createdBy = userID;
        testdatafileCreateManualAdjustment.expected_response[0].updatedBy = userID;
        expect(lockDSSDataResponse).toBeOK();

        let createManualAdjustmentLayerDataResponse;
        createManualAdjustmentLayerDataResponse = await AdjustmentUtility.createManualAdjustmentLayer(request, demandId, testdatafileCreateManualAdjustment);

        // Assertion
        expect(createManualAdjustmentLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getCreateManualAdjustmentLayerDataResponseBody = await createManualAdjustmentLayerDataResponse.json();
        layerId = getCreateManualAdjustmentLayerDataResponseBody[0].layerId;
        delete getCreateManualAdjustmentLayerDataResponseBody[0].layerId;
        delete getCreateManualAdjustmentLayerDataResponseBody[0].dateCreated;
        delete getCreateManualAdjustmentLayerDataResponseBody[0].lastModified;
    
        expect(getCreateManualAdjustmentLayerDataResponseBody).toEqual(testdatafileCreateManualAdjustment.expected_response);
        debug.log("User is able to create a Manual Adjustment layer");
    });

    test("Verify user is able to get and switch to a Manual Adjustment Layer", async ({ request }) => {
        let getManualAdjustmentLayerDataResponse;
        getManualAdjustmentLayerDataResponse = await AdjustmentUtility.getManualAdjustmentLayer(request, demandId, testdatafileGetManualAdjustment);
        testdatafileGetManualAdjustment.expected_response.layers[0].version = forecastVersion
        testdatafileGetManualAdjustment.expected_response.layers[1].version = forecastVersion
        testdatafileGetManualAdjustment.expected_response.layers[0].createdBy = userID;
        testdatafileGetManualAdjustment.expected_response.layers[0].updatedBy = userID;
        testdatafileGetManualAdjustment.expected_response.layers[0].userId = userID;
        // Assertion
        expect(getManualAdjustmentLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getGetManualAdjustmentLayerDataResponseBody = await getManualAdjustmentLayerDataResponse.json();
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].layerId;
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].layerUpdateDateTime;  
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].createdByUserName; 
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].updatedByUserName; 
        delete getGetManualAdjustmentLayerDataResponseBody.layers[1].layerCreationDateTime;
        delete getGetManualAdjustmentLayerDataResponseBody.layers[1].layerId;
        delete getGetManualAdjustmentLayerDataResponseBody.layers[1].layerUpdateDateTime;

        expect(getGetManualAdjustmentLayerDataResponseBody).toEqual(testdatafileGetManualAdjustment.expected_response);
        debug.log("User is able to get and switch to a Manual Adjustment layer");
    });

    test("Verify user is able to edit a Manual Adjustment Layer", async ({ request }) => {
        let editManualAdjustmentLayerDataResponse;
        testdatafileEditManualAdjustment.payload.layers[0].forecastVersion = forecastVersion
        testdatafileEditManualAdjustment.expected_response.layers[0].version = forecastVersion
        testdatafileEditManualAdjustment.expected_response.layers[1].version = forecastVersion
        testdatafileEditManualAdjustment.expected_response.layers[0].createdBy = userID;
        testdatafileEditManualAdjustment.expected_response.layers[0].updatedBy = userID;
        testdatafileEditManualAdjustment.expected_response.layers[0].userId = userID;
        editManualAdjustmentLayerDataResponse = await AdjustmentUtility.editManualAdjustmentLayer(request, demandId, testdatafileEditManualAdjustment);

        // Assertion
        expect(editManualAdjustmentLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getEditManualAdjustmentLayerDataResponseBody = await editManualAdjustmentLayerDataResponse.json();
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].layerId;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].layerUpdateDateTime;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].createdByUserName; 
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].updatedByUserName; 
        delete getEditManualAdjustmentLayerDataResponseBody.layers[1].layerId;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[1].layerUpdateDateTime;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[1].layerCreationDateTime;
        expect(getEditManualAdjustmentLayerDataResponseBody).toEqual(testdatafileEditManualAdjustment.expected_response);
        debug.log("User is able to edit a Manual Adjustment layer");
    });

    test("Verify user is able to delete a Manual Adjustment Layer", async ({ request }) => {
        let deleteManualAdjustmentLayerDataResponse;
        deleteManualAdjustmentLayerDataResponse = await AdjustmentUtility.deleteManualAdjustmentLayer(request, layerId, demandId, testdatafileDeleteManualAdjustment);

        // Assertion
        expect(deleteManualAdjustmentLayerDataResponse).toBeOK();

        debug.log("User is able to delete a Manual Adjustment layer");
    });
})