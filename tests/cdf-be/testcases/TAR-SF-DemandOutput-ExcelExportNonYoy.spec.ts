import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { UploadLayerUtil } from "../fixtures/upload-layer";

test.describe(
  "Verify DemandOutput Excel export data",
  {
    tag: "@Regression @ExcelExportNonYoY @ibg-service-scenario-financials @DemandOutput",
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

    test("Verify: Excel download and verify start year for GMV Shipped mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "GMV Shipped",
        "SBU"
      );
      let isStartDatePresent = false;
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
            if(cellObj.v.includes(String(startDate))) {
                isStartDatePresent = true;
                break;
            }
        }
      }
      expect(isStartDatePresent).toBeTruthy();
    });

    test("Verify: Excel download and verify start year for Net Merch Sales mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "Net Merch Sales",
        "SBU"
      );
      let isStartDatePresent = false;
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
            if(cellObj.v.includes(String(startDate))) {
                isStartDatePresent = true;
                break;
            }
        }
      }
      expect(isStartDatePresent).toBeTruthy();
    });

    test("Verify: Excel download and verify start year for Scanned Units mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "Scanned Units",
        "SBU"
      );
      let isStartDatePresent = false;
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
            if(cellObj.v.includes(String(startDate))) {
                isStartDatePresent = true;
                break;
            }
        }
      }
      expect(isStartDatePresent).toBeTruthy();
    });

    test("Verify: Excel download and verify start year for AUR mertic SBU View", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "AUR",
        "SBU"
      );
      let isStartDatePresent = false;
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
            if(cellObj.v.includes(String(startDate))) {
                isStartDatePresent = true;
                break;
            }
        }
      }
      expect(isStartDatePresent).toBeTruthy();
    });

    test("Verify: Excel download and verify start year for UOM mertic SBU View", async ({
        request,
      }) => {
        const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
          request,
          demandStackId,
          demandScenarioDetails,
          fileName,
          "UOM",
          "SBU"
        );
        let isStartDatePresent = false;
      for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
        if (parseInt(cellId.match(/\d+$/)) === 8) {
            if(cellObj.v.includes(String(startDate))) {
                isStartDatePresent = true;
                break;
            }
        }
      }
      expect(isStartDatePresent).toBeTruthy();
      });


      test("Verify: Excel download and verify start year for GMV Shipped mertic Channel View", async ({
        request,
      }) => {
        const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
          request,
          demandStackId,
          demandScenarioDetails,
          fileName,
          "GMV Shipped",
          "BASE_CHANNEL"
        );
        let isStartDatePresent = false;
        for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
          if (parseInt(cellId.match(/\d+$/)) === 11) {
              if(cellObj.v.includes(String(startDate))) {
                  isStartDatePresent = true;
                  break;
              }
          }
        }
        expect(isStartDatePresent).toBeTruthy();
      });
  
      test("Verify: Excel download and verify start year for Net Merch Sales mertic Channel View", async ({
        request,
      }) => {
        const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
          request,
          demandStackId,
          demandScenarioDetails,
          fileName,
          "Net Merch Sales",
          "BASE_CHANNEL"
        );
        let isStartDatePresent = false;
        for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
          if (parseInt(cellId.match(/\d+$/)) === 10) {
              if(cellObj.v.includes(String(startDate))) {
                  isStartDatePresent = true;
                  break;
              }
          }
        }
        expect(isStartDatePresent).toBeTruthy();
      });
  
      test("Verify: Excel download and verify start year for Scanned Units mertic Channel View", async ({
        request,
      }) => {
        const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
          request,
          demandStackId,
          demandScenarioDetails,
          fileName,
          "Scanned Units",
          "BASE_CHANNEL"
        );
        let isStartDatePresent = false;
        for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
          if (parseInt(cellId.match(/\d+$/)) === 11) {
              if(cellObj.v.includes(String(startDate))) {
                  isStartDatePresent = true;
                  break;
              }
          }
        }
        expect(isStartDatePresent).toBeTruthy();
      });
  
      test("Verify: Excel download and verify start year for AUR mertic Channel View", async ({
        request,
      }) => {
        const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
          request,
          demandStackId,
          demandScenarioDetails,
          fileName,
          "AUR",
          "BASE_CHANNEL"
        );
        let isStartDatePresent = false;
        for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
          if (parseInt(cellId.match(/\d+$/)) === 11) {
              if(cellObj.v.includes(String(startDate))) {
                  isStartDatePresent = true;
                  break;
              }
          }
        }
        expect(isStartDatePresent).toBeTruthy();
      });
  
      test("Verify: Excel download and verify start year for UOM mertic Channel View", async ({
          request,
        }) => {
          const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
            request,
            demandStackId,
            demandScenarioDetails,
            fileName,
            "UOM",
            "BASE_CHANNEL"
          );
          let isStartDatePresent = false;
        for (const [cellId, cellObj] of Object.entries(downloadResponse)) {
          if (parseInt(cellId.match(/\d+$/)) === 10) {
              if(cellObj.v.includes(String(startDate))) {
                  isStartDatePresent = true;
                  break;
              }
          }
        }
        expect(isStartDatePresent).toBeTruthy();
        });
    

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);
