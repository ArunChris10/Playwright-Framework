import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import testDataEMTCreation from '../testdata/emt-layer-creation.json';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileGetEMT from '../testdata/get-emt-layer.json';

test.describe("Verify When user opens an EMT Layer, system should show its corresponding data in the results grid", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let demandId;
    let layerId;
    let getLayerId;
    let forecastVersion;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify data grid updates accordingly when editing EMT", async ({ request }) => {
        await test.step("Fetch the forecast version for the demand stack", async () => {
            forecastVersion = await CdfUtility.getDemandScenarioList(request);
            forecastVersion = forecastVersion.version;
        });

        await test.step("Lock DSS", async () => {
            const lockResponse = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockResponse).toBeOK();
        });
        

        await test.step("Create the EMT Layer", async () => {
            testDataEMTCreation.payload.layers[0].allocationType = 'CONVERTED_SALE';
            testDataEMTCreation.payload.layers[0].forecastVersion = forecastVersion;
            testDataEMTCreation.payload.layers[0].userId = process.env.cdfUser || '';
            testDataEMTCreation.payload.layers[0].allocationUnitType = 'MOVE_UNIT_1_1';

            const createEMTLayerResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testDataEMTCreation);
            expect(createEMTLayerResponse).toBeOK();

            const createEMTLayerResponseBody = await createEMTLayerResponse.json();
            layerId = createEMTLayerResponseBody[0].layerId;
        });

        await test.step("Get all adjustment layers and verify", async () => {
            let getEmtLayerDataResponse = await AdjustmentUtility.getEMTLayer(request, demandId, testdatafileGetEMT);
            expect(getEmtLayerDataResponse).toBeOK();
            let getEmyLayerDataResponseBody = await getEmtLayerDataResponse.json();
            getLayerId = getEmyLayerDataResponseBody.layers[0].layerId;
            expect(getLayerId).toBe(layerId);
        });

    });

});