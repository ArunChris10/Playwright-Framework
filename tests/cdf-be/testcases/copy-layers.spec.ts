import { test, expect } from '../../common/fixtures/test-hook';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileCreateEMT from '../testdata/create-emt-layer.json';
import testdatafileGetEMT from '../testdata/get-emt-layer.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify user can copy layers to a new scenario", { tag: "@Smoke @copyLayersToNewScenario @ibg-service-scenario-financials @Regression"}, () => {
    let demandIdOne;
    let demandIdTwo;
    let layerId;

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandIdOne); await CdfUtility.deleteScenario(request, demandIdTwo); });

    test("Create a new scenario with layers", async ({ request }) => {
        await test.step("Create a new scenario", async () => {
            demandIdOne = await CdfUtility.createScenario(request);
        });

        await test.step("Verify user is able to create a EMT Layer", async () => {
            let lockDSSDataResponse;
            lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandIdOne);
            expect(lockDSSDataResponse).toBeOK();

            let createEmtLayerDataResponse;
            createEmtLayerDataResponse = await AdjustmentUtility.createEMTLayer(request, demandIdOne, testdatafileCreateEMT);

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

        await test.step("Create a new scenario with copied layers", async () => {
            let cloneScenario = await CdfUtility.cloneToNewScenarioWithLayers(request, demandIdOne);
            demandIdTwo = cloneScenario.demandStackDTO.demandStackScenarioId;
            await CdfUtility.checkClonedJobStatus(request,cloneScenario.demandStackDTO.demandStackScenarioId)
            debug.log("Scenario is clone  : ", demandIdTwo);
        });

        await test.step("User gets the list of copied layers from the newly created scenario", async () => {
            let getEmtLayerDataResponse;
            getEmtLayerDataResponse = await AdjustmentUtility.getEMTLayer(request, demandIdTwo, testdatafileGetEMT);

            // Assertion
            expect(getEmtLayerDataResponse).toBeOK();
            
            // Extracting the response body
            let getGetEmtLayerDataResponseBody = await getEmtLayerDataResponse.json();
            let expectedResponse = testdatafileGetEMT.expected_response;
            delete getGetEmtLayerDataResponseBody.layers[0].layerCreationDateTime;
            delete getGetEmtLayerDataResponseBody.layers[0].layerId;
            delete getGetEmtLayerDataResponseBody.layers[0].layerUpdateDateTime;
            delete expectedResponse.layers[0].updatedBy;
            expect(getGetEmtLayerDataResponseBody).toEqual(expectedResponse);
            debug.log("User is able to get and switch to a EMT layer");
        })
    })

    
})