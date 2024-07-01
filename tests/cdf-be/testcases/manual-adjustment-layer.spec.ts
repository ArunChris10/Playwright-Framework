import { test, expect } from '../../common/fixtures/test-hook';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileCreateManualAdjustment from '../testdata/create-manual-adjustment-layer.json';
import testdatafileEditManualAdjustment from '../testdata/edit-manual-adjustment-layer.json';
import testdatafileGetManualAdjustment from '../testdata/get-manual-adjustment-layer.json';
import testdatafileDeleteManualAdjustment from '../testdata/delete-manual-adjustment-layer.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify user can create/edit/delete an Manual Adjustment layer", { tag: "@Smoke @manualAdjustmentLayer"}, () => {
    let layerId;
    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify user is able to create a Manual Adjustment Layer", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
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

        // Assertion
        expect(getManualAdjustmentLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getGetManualAdjustmentLayerDataResponseBody = await getManualAdjustmentLayerDataResponse.json();
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].layerId;
        delete getGetManualAdjustmentLayerDataResponseBody.layers[0].layerUpdateDateTime;
        expect(getGetManualAdjustmentLayerDataResponseBody).toEqual(testdatafileGetManualAdjustment.expected_response);
        debug.log("User is able to get and switch to a Manual Adjustment layer");
    });

    test("Verify user is able to edit a Manual Adjustment Layer", async ({ request }) => {
        let editManualAdjustmentLayerDataResponse;
        editManualAdjustmentLayerDataResponse = await AdjustmentUtility.editManualAdjustmentLayer(request, demandId, testdatafileEditManualAdjustment);

        // Assertion
        expect(editManualAdjustmentLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getEditManualAdjustmentLayerDataResponseBody = await editManualAdjustmentLayerDataResponse.json();
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].layerId;
        delete getEditManualAdjustmentLayerDataResponseBody.layers[0].layerUpdateDateTime;
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