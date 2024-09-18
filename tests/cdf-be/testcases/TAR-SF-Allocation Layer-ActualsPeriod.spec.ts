import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { AllocationUtils } from "../fixtures/allocation-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import debug from "debug";


test.describe("Verify In Allocation creation, throw an error if there is any data before current fiscal month. All deallocations and allocations should only be for current and future fiscal months", { tag: "@Regression @allocationdeallocation @ibg-service-scenario-financials @Allocation Layer" }, () => {
    let demandStackId,
    demandScenarioDetails;

  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });

  test.skip("Verify In Allocation creation, throw an error if there is any data before current fiscal month. All deallocations and allocations should only be for current and future fiscal months", async ({
    request
  }) => {
    // TODO: We can skip this test case in backend and validate it in front end
    await test.step("Verify In Allocation creation, throw an error if there is any data before current fiscal month. All deallocations and allocations should only be for current and future fiscal months", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let demandworkspaceResponse;
        try{
          demandworkspaceResponse = await AllocationUtils.allocationdeallocation(request, demandStackId, demandScenarioDetails);
          console.log(demandworkspaceResponse);
        }
        catch(error){
           debug.log("error ", error.message);
        }
        expect(demandworkspaceResponse.statusCode).toEqual("400");
    })
  });

})
