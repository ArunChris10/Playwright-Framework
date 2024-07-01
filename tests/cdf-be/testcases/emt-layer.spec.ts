import { test, expect } from '../../common/fixtures/test-hook';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileCreateEMT from '../testdata/create-emt-layer.json';
import testdatafileEditEMT from '../testdata/edit-emt-layer.json';
import testdatafileGetEMT from '../testdata/get-emt-layer.json';
import testdatafileDeleteEMT from '../testdata/delete-emt-layer.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify user can create/edit/delete an EMT layer", { tag: "@Smoke @emtLayer"}, () => {
    let layerId;
    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify user is able to create a EMT Layer", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponse).toBeOK();

        let createEmtLayerDataResponse;
        createEmtLayerDataResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testdatafileCreateEMT);

        // Assertion
        expect(createEmtLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getCreateEmtLayerDataResponseBody = await createEmtLayerDataResponse.json();
        layerId = getCreateEmtLayerDataResponseBody[0].layerId;
        delete getCreateEmtLayerDataResponseBody[0].layerId;
        delete getCreateEmtLayerDataResponseBody[0].dateCreated;
        delete getCreateEmtLayerDataResponseBody[0].lastModified;
        expect(getCreateEmtLayerDataResponseBody).toEqual(testdatafileCreateEMT.expected_response);
        debug.log("User is able to create a EMT layer");
    });

    test("Verify user is able to get and switch to a EMT Layer", async ({ request }) => {
        let getEmtLayerDataResponse;
        getEmtLayerDataResponse = await AdjustmentUtility.getEMTLayer(request, demandId, testdatafileGetEMT);

        // Assertion
        expect(getEmtLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getGetEmtLayerDataResponseBody = await getEmtLayerDataResponse.json();
        delete getGetEmtLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getGetEmtLayerDataResponseBody.layers[0].layerId;
        delete getGetEmtLayerDataResponseBody.layers[0].layerUpdateDateTime;
        expect(getGetEmtLayerDataResponseBody).toEqual(testdatafileGetEMT.expected_response);
        debug.log("User is able to get and switch to a EMT layer");
    });

    test("Verify user is able to edit a EMT Layer", async ({ request }) => {
        let editEmtLayerDataResponse;
        editEmtLayerDataResponse = await AdjustmentUtility.editEMTLayer(request, demandId, testdatafileEditEMT);

        // Assertion
        expect(editEmtLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getEditEmtLayerDataResponseBody = await editEmtLayerDataResponse.json();
        delete getEditEmtLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getEditEmtLayerDataResponseBody.layers[0].layerId;
        delete getEditEmtLayerDataResponseBody.layers[0].layerUpdateDateTime;
        expect(getEditEmtLayerDataResponseBody).toEqual(testdatafileEditEMT.expected_response);
        debug.log("User is able to edit a EMT layer");
    });

    test("Verify user is able to delete a EMT Layer", async ({ request }) => {
        let deleteEmtLayerDataResponse;
        deleteEmtLayerDataResponse = await AdjustmentUtility.deleteEMTLayer(request, layerId, demandId, testdatafileDeleteEMT);

        // Assertion
        expect(deleteEmtLayerDataResponse).toBeOK();

        debug.log("User is able to delete a EMT layer");
    });
})