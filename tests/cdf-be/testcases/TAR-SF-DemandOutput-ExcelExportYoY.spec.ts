import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { UploadLayerUtil } from "../fixtures/upload-layer";

test.describe(
  "Verify DemandOutput Excel export data",
  {
    tag: "@Regression @ExcelExportYoY @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandStackId,
      demandScenarioDetails,
      fileName = `download_${new Date().getTime()}_data.xlsx`,
      startDate;

    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
        request,
        demandStackId
      );
      let forecastData = await UploadLayerUtil.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "MONTH",
        "SBU"
      );
      let cutOffDate = parseInt(forecastData.cutOffDate.split("-")[0]);
      startDate = cutOffDate - 5;
      demandScenarioDetails.forecastInfoDTO.forecastInfo.forecastLayerId = [];
    });

    test("Verify: Excel download and verify start year for gmv YoY mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "GMV YoY Growth %",
        "SBU"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for scanned units YoY mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "Scanned Units YoY Growth %",
        "SBU"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for aur YoY mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "AUR YoY Growth %",
        "SBU"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for uom YoY mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "UOM YoY Growth %",
        "SBU"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for gmv YoY mertic Channel View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "GMV YoY Growth %",
        "BASE_CHANNEL"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for scanned units YoY mertic Channel View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "Scanned Units YoY Growth %",
        "BASE_CHANNEL"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for aur YoY mertic Channel View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "AUR YoY Growth %",
        "BASE_CHANNEL"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });

    test("Verify: Excel download and verify start year for uom YoY mertic Channel View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "UOM YoY Growth %",
        "BASE_CHANNEL"
      );
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
          expect(cellObj.v.includes(String(startDate))).toBeFalsy();
        }
      }
    });
    

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);
