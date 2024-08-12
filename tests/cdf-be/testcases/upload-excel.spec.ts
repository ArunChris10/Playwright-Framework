import { test, expect } from "../../common/fixtures/test-hook";
import { UploadLayerUtil } from "../fixtures/upload-layer";
import allocationsData from "../testdata/allocation-layer-data.json";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify ", { tag: "@Smoke @verifyUploadLayer @ibg-service-scenario-financials @Regression" }, () => {
  let layerId,
    demandStackId,
    demandScenarioDetails,
    fileName = `download_${new Date().getTime()}_data.xlsx`;

  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });

  test("Verify user is able to download excel", async ({ request }) => {
    const response = await UploadLayerUtil.verifyDownloadExcel(
      request,
      demandStackId,
      demandScenarioDetails,
      fileName
    );
    expect(response).toBeOK;
  });

  test("Verify user is able to modify and upload excel", async ({
    request,
  }) => {
    const response = await UploadLayerUtil.verifyUploadExcel(
      request,
      demandStackId,
      demandScenarioDetails
    );
    layerId = response[0].layerId;
    expect(response[0].layerName).toBe(allocationsData.layerName);
    const layerData = await UploadLayerUtil.getLayerData(request, layerId);
    expect(JSON.parse(layerData.layerJson)[0]["forecast"][0].amount).toBe(
      allocationsData.uploadExcelLayerForecastAmount
    );
  });

  test("Verify user can edit a Upload layer name and description", async ({
    request,
  }) => {
    const response = await UploadLayerUtil.updateDescriptionApi(
      request,
      demandStackId,
      demandScenarioDetails,
      layerId
    );
    expect(response).toBeOK();
  });

  test("Verify user can delete a Uploaded layer", async ({ request }) => {
    const response = await UploadLayerUtil.deleteUploadLayer(
      request,
      demandStackId,
      layerId
    );
    expect(response).toBeOK();
  });
  test.afterAll(async ({ request }) => {
    await CdfUtility.deleteScenario(request, demandStackId);
  });
});
