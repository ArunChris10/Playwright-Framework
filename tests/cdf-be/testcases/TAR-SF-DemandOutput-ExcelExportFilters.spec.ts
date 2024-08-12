import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { UploadLayerUtil } from "../fixtures/upload-layer";
import filterData from "../testdata/ds-excelexport.json";

test.describe(
  "Verify DemandOutput Excel export data",
  {
    tag: "@Regression @DSOutputExcelExport @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandStackId,
      demandScenarioDetails,
      fileName = `download_${new Date().getTime()}_data.xlsx`,
      expectedResponse = {},
      forecastData,
      actualsYearMonth,
      forecastYearMonth;

    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
        request,
        demandStackId
      );

      forecastData = await UploadLayerUtil.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "MONTH",
        "DEPARTMENT",
        [],
        filterData.baseChannels,
        filterData.baseChannelIds,
        filterData.sbuNames,
        filterData.sbuIds,
        filterData.departments,
        filterData.departmentIds,
        filterData.channelGroups,
        filterData.channelGroupIds
      );
      let cutOffDate = parseInt(forecastData.cutOffDate.split("-").join(""));
      actualsYearMonth = String(cutOffDate);
      forecastYearMonth = String(cutOffDate + 1);
      demandScenarioDetails.forecastInfoDTO.forecastInfo.forecastLayerId = [];
      UploadLayerUtil.getFilteredForecastData(
        expectedResponse,
        forecastData,
        actualsYearMonth
      );
      UploadLayerUtil.getFilteredForecastData(
        expectedResponse,
        forecastData,
        forecastYearMonth
      );
    });

    test("Verify: Excel download with filters and verify gmv data", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "GMV Shipped",
        filterData.baseChannels,
        filterData.baseChannelIds,
        filterData.sbuNames,
        filterData.sbuIds,
        filterData.departments,
        filterData.departmentIds,
        filterData.channelGroups,
        filterData.channelGroupIds,
        [actualsYearMonth, forecastYearMonth]
      );
      UploadLayerUtil.validateDownloadResponseWithJson(
        downloadResponse,
        expectedResponse,
        actualsYearMonth,
        forecastYearMonth,
        "amount"
      );
    });

    test("Verify: Excel download with filters and verify scanned units data", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "Scanned Units",
        filterData.baseChannels,
        filterData.baseChannelIds,
        filterData.sbuNames,
        filterData.sbuIds,
        filterData.departments,
        filterData.departmentIds,
        filterData.channelGroups,
        filterData.channelGroupIds,
        [actualsYearMonth, forecastYearMonth]
      );
      UploadLayerUtil.validateDownloadResponseWithJson(
        downloadResponse,
        expectedResponse,
        actualsYearMonth,
        forecastYearMonth,
        "units"
      );
    });

    test("Verify: Excel download with filters and verify Net Merch Sales data", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "Net Merch Sales",
        filterData.baseChannels,
        filterData.baseChannelIds,
        filterData.sbuNames,
        filterData.sbuIds,
        filterData.departments,
        filterData.departmentIds,
        filterData.channelGroups,
        filterData.channelGroupIds,
        [actualsYearMonth, forecastYearMonth]
      );
      UploadLayerUtil.validateDownloadResponseWithJson(
        downloadResponse,
        expectedResponse,
        actualsYearMonth,
        forecastYearMonth,
        "sales"
      );
    });

    test("Verify: Excel download with filters and verify AUR data", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "AUR",
        filterData.baseChannels,
        filterData.baseChannelIds,
        filterData.sbuNames,
        filterData.sbuIds,
        filterData.departments,
        filterData.departmentIds,
        filterData.channelGroups,
        filterData.channelGroupIds,
        [actualsYearMonth, forecastYearMonth]
      );
      UploadLayerUtil.validateDownloadResponseWithJson(
        downloadResponse,
        expectedResponse,
        actualsYearMonth,
        forecastYearMonth,
        "aur"
      );
    });

    test("Verify: Excel download with filters and verify UOM data", async ({
      request,
    }) => {
      const downloadResponse = await UploadLayerUtil.downloadExcelandReturnData(
        request,
        demandStackId,
        demandScenarioDetails,
        fileName,
        "UOM",
        filterData.baseChannels,
        filterData.baseChannelIds,
        filterData.sbuNames,
        filterData.sbuIds,
        filterData.departments,
        filterData.departmentIds,
        filterData.channelGroups,
        filterData.channelGroupIds,
        [actualsYearMonth, forecastYearMonth]
      );
      UploadLayerUtil.validateDownloadResponseWithJson(
        downloadResponse,
        expectedResponse,
        actualsYearMonth,
        forecastYearMonth,
        "uomValue"
      );
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);
