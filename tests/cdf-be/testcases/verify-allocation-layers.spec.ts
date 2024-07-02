import { test, expect } from "../../common/fixtures/test-hook";
import { AllocationUtils } from "../fixtures/allocation-utils";
import allocationsData from "../testdata/allocation-layer-data.json";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify ", { tag: "@Smoke @verifyAllocations" }, () => {
  let layerId, demandStackId, demandScenarioDetails;

  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
      request,
      demandStackId
    );
  });

  test("Verify user is able to generate preview for Overrides", async ({
    request,
  }) => {
    const generatedlayerId =
      await AllocationUtils.verifyGeneratePreviewAllocationSplitLayer(
        request,
        demandStackId,
        demandScenarioDetails
      );
    layerId = generatedlayerId;
    expect(typeof generatedlayerId).toBe("string");
  });

  test("Verify user is able to create and save allocation for Overrides", async ({
    request,
  }) => {
    const response = await AllocationUtils.verifySaveAllocationSplitLayer(
      request,
      layerId,
      demandStackId,
      demandScenarioDetails
    );
    expect(response[0].isConfirmed).toBe(true);
  });

  test("Verify user is able to create multiple allocation layers", async ({
    request,
  }) => {
    const generatedlayerId =
      await AllocationUtils.verifyGeneratePreviewAllocationSplitLayer(
        request,
        demandStackId,
        demandScenarioDetails
      );
    layerId = generatedlayerId;
    const response = await AllocationUtils.verifySaveAllocationSplitLayer(
      request,
      generatedlayerId,
      demandStackId,
      demandScenarioDetails
    );
    expect(response[0].isConfirmed).toBe(true);
  });

  test("Verify if created layer is selected", async ({ request }) => {
    const response = await AllocationUtils.verifySelectedLayer(
      request,
      demandStackId
    );
    expect(response).toContain(layerId);
  });

  test("Verify if user is able to deselect layer and data is reflecting", async ({
    request,
  }) => {
    const response = await AllocationUtils.verifyDataOnRemovingLayer(
      request,
      demandStackId,
      demandScenarioDetails,
      layerId
    );
    expect(response).toBe(allocationsData?.differenceAmount);
  });

  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request, demandStackId);
  });
});
