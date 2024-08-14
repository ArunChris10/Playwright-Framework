import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";
import testDataManualAdjustment from "../testdata/create-manual-adjustment-layer.json";

test.describe(
  "Verify aggregation view by Year, Quarter and month views across all the output sections which includes Launchpad output, Split output , Intel layers  and highlighter.",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId, demandScenarioDetails, layerId;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
        request,
        demandId
      );
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify aggregation views for Launchpad output", async ({
      request,
    }) => {
      await CdfUtility.verifyForecastAggregationWithMinimumDataPayload(
        request,
        demandId
      );
    });

    test("Verify aggregation views for Split output", async ({ request }) => {
      layerId = await AllocationUtils.verifyGeneratePreviewAllocationSplitLayer(
        request,
        demandId,
        demandScenarioDetails
      );
      await CdfUtility.verifyForecastAggregationWithMinimumDataPayload(
        request,
        demandId,
        layerId
      );
    });

    test("Verify aggregation views for Intel layers or highlighter (using Manual Adjustment)", async ({
      request,
    }) => {
      await test.step("Lock DSS", async () => {
        const lockResponse = await LockUnlockUtility.lockDSSData(
          request,
          demandId
        );
        expect(lockResponse).toBeOK();
      });

      await test.step("Create Manual for layer id and verify", async () => {
        testDataManualAdjustment.payload.layers[0].forecastVersion =
          CdfUtility.createScenarioPayload.forecastInfoDTO.forecastInfo.version;
        const response = await AdjustmentUtility.createManualAdjustmentLayer(
          request,
          demandId,
          testDataManualAdjustment
        );
        expect(response).toBeOK();
        layerId = (await response.json())[0].layerId;
        await CdfUtility.verifyForecastAggregationWithMinimumDataPayload(
          request,
          demandId,
          layerId
        );
      });
    });
  }
);
