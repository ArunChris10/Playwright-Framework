import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";


test.describe("Verify When user clicks the pencil icon on a layer and edit both layer Title and Description on the modal", { tag: "@Regression @editLayerTitleDescription @ibg-service-scenario-financials @Adjustment" }, () => {
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


  test("Verify When user clicks the pencil icon on a layer and edit both layer Title and Description on the modal ", async ({
    request
  }) => {
    await test.step("Verify When user clicks the pencil icon on a layer and edit both layer Title and Description on the modal", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let editTitleDescriptionResponse = await AdjustmentUtility.editTitileDescriptionAdjustment(request, demandStackId, demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version, "test-name");
        expect(editTitleDescriptionResponse.demandStackDTO.title).toEqual("test-name");
        let editTitleDescriptionResponseOther = await AdjustmentUtility.editTitileDescriptionAdjustment(request, demandStackId, demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version, "test-name2");
        expect(editTitleDescriptionResponseOther.demandStackDTO.title).toEqual("test-name2");
        console.log(editTitleDescriptionResponse);
    })
  });

})
