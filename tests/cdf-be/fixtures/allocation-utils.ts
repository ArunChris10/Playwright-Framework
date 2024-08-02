import debug from "debug";
import allocationsData from "../testdata/allocation-layer-data.json";
import { expect } from "@playwright/test";
import { DemandBaseClass } from "./demand-common-utils";
import commonEndpoints from "../testdata/common-demand-endpoints.json";

export class AllocationUtils extends DemandBaseClass {
  static async getDemandScenarioSplits(
    request,
    demandStackId,
    demandScenarioDetails
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioSplitsEndpoint}`;
    const payload = {
      demandStackScenarioId: demandStackId,
      forecastFilter: {
        version: demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        sbu: [],
        department: [],
        baseChannel: [],
        demandChannel: [allocationsData?.sourceChannel],
        layerIds: [],
        timeFilter: {
          filterLevel: allocationsData?.filterLevel,
          yearMonths: [],
          quarters: {},
        },
        demandChannelIds: [allocationsData?.sourceChannelId],
      },
    };
    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async getDemandScenarioForecast(
    request,
    demandStackId,
    demandScenarioDetails,
    layerIds
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.getDemandScenarioForecastEndpoint}${demandStackId}`;
    const payload = {
      sbu: [],
      sbuIds: [],
      department: [],
      departmentIds: [],
      baseChannel: [allocationsData?.targetChannel],
      baseChannelIds: [allocationsData?.targetChannelId],
      channelGroup: [],
      channelGroupIds: [],
      demandChannel: [],
      layerIds: layerIds,
      clearAll: false,
      includeDerivedMetrics: false,
      includeTotals: true,
      organizationalLevel: "SBU",
      loadHeirarchyParams: null,
      timeFilter: {
        filterLevel: allocationsData.filterLevel,
        isYearSelected: false,
        isMonthSelected: false,
        isQuarterSelected: false,
        yearMonths: [],
        yearQuarters: [],
        years: [],
        yearList: [],
      },
      filtersChanged: true,
      filterLoadComplete: true,
      version: demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
      departmentName: [],
      isUfmSyncCache: false,
      latestSyncScenario: false,
    };
    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async getDemandScenarioLayers(request, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}?layerType=CHANNEL_SPLIT`;
    // API Request
    const response = await request.get(endpointURL, {
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async updateDemandScenarioSplit(
    request,
    sellerFulfilled,
    mrktplaceFullfilled,
    isConfirmed,
    layerId,
    demandStackId,
    demandScenarioDetails
  ) {
    const dateFormat = `${sellerFulfilled.forecast[0].year}-${
      sellerFulfilled.forecast[0].month < 10
        ? "0" + sellerFulfilled.forecast[0].month
        : sellerFulfilled.forecast[0].month
    }`;
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}`;
    let payload = {
      layers: [
        {
          allocationType: "DOLLAR",
          layerType: "CHANNEL_SPLIT",
          isConfirmed: isConfirmed,
          isPreview: !isConfirmed,
          layerName: allocationsData?.sourceChannel,
          layerDescription: "",
          forecastVersion:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
          demandChannel: sellerFulfilled.demandChannel,
          demandChannelId: sellerFulfilled.demandChannelId,
          lastUpdated:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.lastModified,
        },
      ],
    };
    if (layerId) {
      payload.layers[0].layerId = layerId;
    } else {
      payload.layers[0].monthlySplitsRequest = {
        [dateFormat]: [
          {
            baseChannel: sellerFulfilled.baseChannel,
            baseChannelId: sellerFulfilled.baseChannelId,
            amount: sellerFulfilled.forecast[0].amount + allocationsData?.differenceAmount,
          },
          {
            baseChannel: mrktplaceFullfilled.baseChannel,
            baseChannelId: mrktplaceFullfilled.baseChannelId,
            amount: mrktplaceFullfilled.forecast[0].amount - allocationsData?.differenceAmount,
          },
        ],
      };
    }
    // API Request
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async verifyGeneratePreviewAllocationSplitLayer(
    request,
    demandStackId,
    demandScenarioDetails
  ) {
    const getScenarioSplit = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const mrktplaceFullfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[1];
    const putScenarioSplit = await this.updateDemandScenarioSplit(
      request,
      sellerFulfilled,
      mrktplaceFullfilled,
      false,
      null,
      demandStackId,
      demandScenarioDetails
    );
    const getScenarioSplitPostUpdate = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    expect(
      getScenarioSplitPostUpdate.overrideForecast[0].baseChannelForecast[0]
        .forecast[0].amount ===
        getScenarioSplit.overrideForecast[0].baseChannelForecast[0].forecast[0]
          .amount &&
        getScenarioSplit.overrideForecast[0].baseChannelForecast[1].forecast[0]
          .amount ===
          getScenarioSplitPostUpdate.overrideForecast[0].baseChannelForecast[1]
            .forecast[0].amount
    ).toBe(true);
    return putScenarioSplit[0].layerId;
  }

  static async verifySaveAllocationSplitLayer(
    request,
    layerId,
    demandStackId,
    demandScenarioDetails
  ) {
    const getScenarioSplit = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const mrktplaceFullfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[1];
    const lockDemandScenarioResponse = await this.lockUnlockDemandScenario(
      request,
      "lock",
      demandStackId
    );
    expect(lockDemandScenarioResponse).toBeOK();
    const putScenarioSplitConfirmed = await this.updateDemandScenarioSplit(
      request,
      sellerFulfilled,
      mrktplaceFullfilled,
      true,
      layerId,
      demandStackId,
      demandScenarioDetails
    );
    return putScenarioSplitConfirmed;
  }

  static async verifySelectedLayer(request, demandStackId) {
    const layersData = await this.getDemandScenarioLayers(
      request,
      demandStackId
    );
    const layerIds = layersData.layers.map((layer) => layer.layerId);

    return layerIds;
  }

  static async verifyDataOnRemovingLayer(
    request,
    demandStackId,
    demandScenarioDetails,
    layerId
  ) {
    const getScenarioSplit = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const month = sellerFulfilled.forecast[0].month;
    const year = sellerFulfilled.forecast[0].year;
    const initialAmount = sellerFulfilled.forecast[0].amount;

    const layersData = await this.getDemandScenarioLayers(
      request,
      demandStackId
    );
    let layerIds = layersData.layers.map((layer) => layer.layerId);
    layerIds = layerIds.filter((layer) => layer !== layerId);
    const response = await this.getDemandScenarioForecast(
      request,
      demandStackId,
      demandScenarioDetails,
      layerIds
    );
    let totalForecasts = response.forecastTotals.grandTotal.forecast;
    totalForecasts = totalForecasts.filter(
      (forecast) => forecast.year === year && forecast.month === month
    );
    return Math.abs(totalForecasts[0].amount - initialAmount);
  }
}
