import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";
import { UploadLayerUtil } from "../fixtures/upload-layer";
import filterData from "../testdata/ds-excelexport.json";

test.describe(
  "Verify if Excel download is as per filter selected",
  {
    tag: "@Regression @ibg-service-scenario-financials @Allocation Layer",
  },
  () => {
    let demandStackId,
      demandScenarioDetails,
      layerId,
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

      layerId = await AllocationUtils.verifyGeneratePreviewAllocationSplitLayer(
        request,
        demandStackId,
        demandScenarioDetails
      );

      forecastData = await UploadLayerUtil.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "MONTH",
        "DEPARTMENT",
        [layerId] as any,
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

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });

    test("Excel download with filters", async ({ request }) => {
      await test.step(`Verify: Excel download with filters and verify gmv data`, async () => {
        const downloadResponse =
          await UploadLayerUtil.downloadExcelandReturnData(
            request,
            demandStackId,
            demandScenarioDetails,
            fileName,
            "GMV Shipped",
            "SBU",
            filterData.baseChannels,
            filterData.baseChannelIds,
            filterData.sbuNames,
            filterData.sbuIds,
            filterData.departments,
            filterData.departmentIds,
            filterData.channelGroups,
            filterData.channelGroupIds,
            [actualsYearMonth, forecastYearMonth],
            [layerId] as any
          );
        UploadLayerUtil.validateDownloadResponseWithJson(
          downloadResponse,
          expectedResponse,
          actualsYearMonth,
          forecastYearMonth,
          "amount"
        );
      });

      await test.step("Verify: Excel download with filters and verify scanned units data", async () => {
        const downloadResponse =
          await UploadLayerUtil.downloadExcelandReturnData(
            request,
            demandStackId,
            demandScenarioDetails,
            fileName,
            "Scanned Units",
            "SBU",
            filterData.baseChannels,
            filterData.baseChannelIds,
            filterData.sbuNames,
            filterData.sbuIds,
            filterData.departments,
            filterData.departmentIds,
            filterData.channelGroups,
            filterData.channelGroupIds,
            [actualsYearMonth, forecastYearMonth],
            [layerId] as any
          );
        UploadLayerUtil.validateDownloadResponseWithJson(
          downloadResponse,
          expectedResponse,
          actualsYearMonth,
          forecastYearMonth,
          "units"
        );
      });

      await test.step("Verify: Excel download with filters and verify Net Merch Sales data", async () => {
        const downloadResponse =
          await UploadLayerUtil.downloadExcelandReturnData(
            request,
            demandStackId,
            demandScenarioDetails,
            fileName,
            "Net Merch Sales",
            "SBU",
            filterData.baseChannels,
            filterData.baseChannelIds,
            filterData.sbuNames,
            filterData.sbuIds,
            filterData.departments,
            filterData.departmentIds,
            filterData.channelGroups,
            filterData.channelGroupIds,
            [actualsYearMonth, forecastYearMonth],
            [layerId] as any
          );
        UploadLayerUtil.validateDownloadResponseWithJson(
          downloadResponse,
          expectedResponse,
          actualsYearMonth,
          forecastYearMonth,
          "sales"
        );
      });

      await test.step("Verify: Excel download with filters and verify AUR data", async () => {
        const downloadResponse =
          await UploadLayerUtil.downloadExcelandReturnData(
            request,
            demandStackId,
            demandScenarioDetails,
            fileName,
            "AUR",
            "SBU",
            filterData.baseChannels,
            filterData.baseChannelIds,
            filterData.sbuNames,
            filterData.sbuIds,
            filterData.departments,
            filterData.departmentIds,
            filterData.channelGroups,
            filterData.channelGroupIds,
            [actualsYearMonth, forecastYearMonth],
            [layerId] as any
          );
        UploadLayerUtil.validateDownloadResponseWithJson(
          downloadResponse,
          expectedResponse,
          actualsYearMonth,
          forecastYearMonth,
          "aur"
        );
      });

      await test.step("Verify: Excel download with filters and verify UOM data", async () => {
        const downloadResponse =
          await UploadLayerUtil.downloadExcelandReturnData(
            request,
            demandStackId,
            demandScenarioDetails,
            fileName,
            "UOM",
            "SBU",
            filterData.baseChannels,
            filterData.baseChannelIds,
            filterData.sbuNames,
            filterData.sbuIds,
            filterData.departments,
            filterData.departmentIds,
            filterData.channelGroups,
            filterData.channelGroupIds,
            [actualsYearMonth, forecastYearMonth],
            [layerId] as any
          );
        UploadLayerUtil.validateDownloadResponseWithJson(
          downloadResponse,
          expectedResponse,
          actualsYearMonth,
          forecastYearMonth,
          "uomValue"
        );
      });
    });
  }
);
