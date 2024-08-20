
import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import testdatafile from '../testdata/current-demand.json';
import testdatafileGetManualAdjustment from '../testdata/get-manual-adjustment-layer.json';
import testDataEMTCreation from '../testdata/emt-layer-creation.json'
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import { DemandBaseClass } from "../fixtures/demand-common-utils";

test.describe(
  "Verify star icon is displayed when a DSS is published on layer",
  {
    tag: "@Regression @ibg-service-scenario-financials @Publish",
  },
  () => {
    let demandId,
      publishDssResponse,
      slotId = 1,
      forecastVersion;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify if user can see the star icon on layer", async ({ request }) => {
      await test.step("Fetch the forecast version for the demand stack", async () => {
            forecastVersion = await CdfUtility.getDemandScenarioList(request);
            forecastVersion = forecastVersion.version;
      });

      await test.step("Lock DSS", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandId);
      });

      await test.step("Create a new layer", async () => {
        testDataEMTCreation.payload.layers[0].allocationType = 'CONVERTED_SALE';
        testDataEMTCreation.payload.layers[0].forecastVersion = forecastVersion;
        testDataEMTCreation.payload.layers[0].userId = process.env.cdfUser || '';
        testDataEMTCreation.payload.layers[0].allocationUnitType = 'MOVE_UNIT_1_1';

        const createEMTLayerResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testDataEMTCreation);
        expect(createEMTLayerResponse).toBeOK();
      });

      await test.step("Publish newly created demand scenario on slot id = 1", async () => {
        publishDssResponse = await CdfUtility.publishDSS(
          request,
          demandId,
          slotId
        );
        expect(publishDssResponse).toBeOK();
        let publishDssResponseBody = await publishDssResponse.json();
        expect(publishDssResponseBody.message).toEqual(
          testdatafile.expected_response.message
        );
      });

      await test.step("Get publish status", async () => {
        let demandStackScenario;
        let publishStatus;
        publishStatus = await CdfUtility.pollPublishData(request);
        let response = await CdfUtility.getDemandStackScenarioTotalList(
          request,
          false
        );
        demandStackScenario = response.find((element) => {
          if (element.demandStackScenarioId === demandId) {
            return element;
          }
        });
        if (publishStatus.jobStatus === testdatafile.expected_status_response) {
          expect(demandStackScenario.syncDate).not.toBeNull();
        }
      });

      await test.step("Verify layer has star icon", async () => {
        let getManualAdjustmentLayerDataResponse = await AdjustmentUtility.getManualAdjustmentLayer(request, demandId, testdatafileGetManualAdjustment);
        expect(getManualAdjustmentLayerDataResponse).toBeOK();

        let getManualAdjustmentLayerDataResponseBody = await getManualAdjustmentLayerDataResponse.json();
        expect(getManualAdjustmentLayerDataResponseBody.layers[0].syncDate).toBeDefined();
      })
    });
  }
);