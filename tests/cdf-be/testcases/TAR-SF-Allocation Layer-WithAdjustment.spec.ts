import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import testdatafileCreateManualAdjustment from '../testdata/create-manual-adjustment-layer.json';
import { AllocationUtils } from "../fixtures/allocation-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import debug from "debug";


test.describe("Verify When user has already done Merch Intel (that is Intel Layer exists) Block users from updating any splits",
 { tag: "@Regression @intellayerupdateallocation @ibg-service-scenario-financials @Allocation Layer" }, () => {
    let demandStackId,
    demandScenarioDetails;

  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandStackId); });

  test("Verify When user has already done Merch Intel (that is Intel Layer exists) Block users from updating any splits ", async ({
    request
  }) => {
    await test.step("Verify When user has already done Merch Intel (that is Intel Layer exists) Block users from updating any splits ", async () => {
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      testdatafileCreateManualAdjustment.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
      await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, testdatafileCreateManualAdjustment);
      await DemandBaseClass.getDemandScenarioStackWithQueryParams(request, demandStackId);
      let getScenarioSplit = await AllocationUtils.getDemandScenarioSplits(request, demandStackId, demandScenarioDetails);
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const mrktplaceFullfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[1];
    let putScenarioSplit;
    try{
         putScenarioSplit = await AllocationUtils.updateDemandScenarioSplit(
            request,
            sellerFulfilled,
            mrktplaceFullfilled,
            false,
            null,
            demandStackId,
            demandScenarioDetails
          );
        console.log(putScenarioSplit);
    }
    catch(error) {
        debug.log("Error ", error.message);
    }
    expect(putScenarioSplit.message).toEqual("Unable to Create Channel Allocation Layer because Adjustment layers exist");
    expect(putScenarioSplit.statusCode).toEqual("400");
    expect(putScenarioSplit.error).toEqual("INVALID_REQUEST");
  })
  
  });

})
