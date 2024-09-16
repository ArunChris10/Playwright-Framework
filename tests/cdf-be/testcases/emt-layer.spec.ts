import { test, expect } from '../../common/fixtures/test-hook';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileCreateEMT from '../testdata/create-emt-layer.json';
import testdatafileEditEMT from '../testdata/edit-emt-layer.json';
import testdatafileGetEMT from '../testdata/get-emt-layer.json';
import testdatafileDeleteEMT from '../testdata/delete-emt-layer.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify user can create/edit/delete an EMT layer", { tag: "@Smoke @emtLayer @ibg-service-scenario-financials @Regression"}, () => {
    let layerId;
    let demandId;
    let forecastVersion

    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ request }) => { 
        demandId = await CdfUtility.createScenario(request); 
        forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
        console.log("Forecast Version: ", forecastVersion)
    
    });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify user is able to create a EMT Layer", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponse).toBeOK();

        let createEmtLayerDataResponse;
        testdatafileCreateEMT.payload.layers[0].forecastVersion = forecastVersion
        testdatafileCreateEMT.expected_response[0].forecastVersion = forecastVersion

        createEmtLayerDataResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testdatafileCreateEMT);

        // Assertion
        expect(createEmtLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getCreateEmtLayerDataResponseBody = await createEmtLayerDataResponse.json();
        layerId = getCreateEmtLayerDataResponseBody[0].layerId;
        delete getCreateEmtLayerDataResponseBody[0].layerId;
        delete getCreateEmtLayerDataResponseBody[0].dateCreated;
        delete getCreateEmtLayerDataResponseBody[0].lastModified;
        delete getCreateEmtLayerDataResponseBody[0].createdBy;
        delete getCreateEmtLayerDataResponseBody[0].updatedBy;
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
        delete getGetEmtLayerDataResponseBody.layers[1].layerCreationDateTime;
        delete getGetEmtLayerDataResponseBody.layers[1].layerId;
        delete getGetEmtLayerDataResponseBody.layers[1].layerUpdateDateTime;
        // delete getGetEmtLayerDataResponseBody.layers[0].forecastVersion;
        testdatafileGetEMT.expected_response.layers[0].version = forecastVersion
        testdatafileGetEMT.expected_response.layers[0].userId = process.env.cdfUser
        delete getGetEmtLayerDataResponseBody.layers[0].updatedBy;
        delete getGetEmtLayerDataResponseBody.layers[0].createdBy;
        delete getGetEmtLayerDataResponseBody.layers[0].createdByUserName;
        delete getGetEmtLayerDataResponseBody.layers[0].updatedByUserName;
        expect(getGetEmtLayerDataResponseBody.layers[0]).toEqual(testdatafileGetEMT.expected_response.layers[0]);
        debug.log("User is able to get and switch to a EMT layer");
    });

    test("Verify user is able to edit a EMT Layer", async ({ request }) => {
        let editEmtLayerDataResponse;
        testdatafileEditEMT.payload.layers[0].forecastVersion = forecastVersion
        editEmtLayerDataResponse = await AdjustmentUtility.editEMTLayer(request, demandId, testdatafileEditEMT);

        // Assertion
        expect(editEmtLayerDataResponse).toBeOK();
        
        // Extracting the response body
        let getEditEmtLayerDataResponseBody = await editEmtLayerDataResponse.json();
        testdatafileEditEMT.expected_response.layers[0].version = forecastVersion
        testdatafileEditEMT.expected_response.layers[0].userId = process.env.cdfUser
        delete getEditEmtLayerDataResponseBody.layers[0].layerCreationDateTime;
        delete getEditEmtLayerDataResponseBody.layers[0].layerId;
        delete getEditEmtLayerDataResponseBody.layers[0].layerUpdateDateTime;
        delete getEditEmtLayerDataResponseBody.layers[0].createdBy;
        delete getEditEmtLayerDataResponseBody.layers[0].updatedBy;
        delete getEditEmtLayerDataResponseBody.layers[0].createdByUserName;
        delete getEditEmtLayerDataResponseBody.layers[0].updatedByUserName;
        expect(getEditEmtLayerDataResponseBody.layers[0]).toEqual(testdatafileEditEMT.expected_response.layers[0]);
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