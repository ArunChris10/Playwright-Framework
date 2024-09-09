import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from '../fixtures/cdf-utils';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import testdatafileNetMoveEMT from '../testdata/emt-net-move-validation.json';
import testdatafileNetMoveNonZeroEMT from '../testdata/emt-net-move-nonzero-validation.json';

test.describe("Verify user can decallocate in EMT layer", { tag: "@netMove @Regression @ibg-service-scenario-financials"}, () => {
    let layerId;
    let demandId;
    let demandScenarioDetails;

    test.describe.configure({ mode: "serial" });
    test.beforeAll(async ({ request }) => {
        demandId = await CdfUtility.createScenario(request);
        demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
          request,
          demandId
        );
      });

   // test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify if EMT layer can be created with Net Move value as Zero", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponse).toBeOK();

        let emtLayerCreationResponse;
        let forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
        testdatafileNetMoveEMT.payload.layers[0].forecastVersion = forecastVersion;
        emtLayerCreationResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testdatafileNetMoveEMT);

            expect(emtLayerCreationResponse).toBeOK();

            let getCreateEmtLayerDataResponseBody = await emtLayerCreationResponse.json();
            layerId = getCreateEmtLayerDataResponseBody[0].layerId;

            let netMove  = getCreateEmtLayerDataResponseBody[0].totalBudget;
            expect(netMove).toEqual(0);

            delete getCreateEmtLayerDataResponseBody[0].layerId;
            delete getCreateEmtLayerDataResponseBody[0].dateCreated;
            delete getCreateEmtLayerDataResponseBody[0].lastModified;

    });

    test("Verify if EMT layer can be created with Net Move value as Non Zero", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponse).toBeOK();

        let emtLayerCreationNonZeroResponse;
        let forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
        testdatafileNetMoveNonZeroEMT.payload.layers[0].forecastVersion = forecastVersion;
        emtLayerCreationNonZeroResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testdatafileNetMoveNonZeroEMT);

            expect(emtLayerCreationNonZeroResponse).toBeOK();

            let getCreateEmtLayerDataNonZeroResponseBody = await emtLayerCreationNonZeroResponse.json();
            layerId = getCreateEmtLayerDataNonZeroResponseBody[0].layerId;

            let netMove  = getCreateEmtLayerDataNonZeroResponseBody[0].totalBudget;

            expect(netMove).not.toEqual(0);

            delete getCreateEmtLayerDataNonZeroResponseBody[0].layerId;
            delete getCreateEmtLayerDataNonZeroResponseBody[0].dateCreated;
            delete getCreateEmtLayerDataNonZeroResponseBody[0].lastModified;

    });

});
