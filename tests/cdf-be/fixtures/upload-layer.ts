import allocationsData from "../testdata/allocation-layer-data.json";
import dataStream from "../testdata/excel-encoded.json";
import { DemandBaseClass } from "./demand-common-utils";
import commonEndpoints from "../testdata/common-demand-endpoints.json";

export class UploadLayerUtil extends DemandBaseClass {
  static async verifyDownloadExcel(
    request,
    demandStackId,
    demandScenarioDetails,
    fileName
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandStackId}/excel`;
    const payload = {
      sbu: [],
      sbuIds: [],
      department: [],
      departmentIds: [],
      baseChannel: [],
      baseChannelIds: [],
      channelGroup: [],
      channelGroupIds: [],
      demandChannel: [],
      layerIds: [
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.forecastLayerId,
      ],
      clearAll: false,
      includeDerivedMetrics: false,
      includeTotals: true,
      organizationalLevel: "SBU",
      loadHeirarchyParams: null,
      timeFilter: {
        filterLevel: "MONTH",
        isYearSelected: false,
        isMonthSelected: false,
        isQuarterSelected: false,
        yearMonths: [],
        yearQuarters: [],
        years: [],
        yearList: [],
      },
      version: demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
      forceRefresh: false,
      filtersChanged: true,
      departmentName: [],
      filterLoadComplete: true,
      metricType: "GMV Shipped",
    };
    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    await this.saveExcel(response, fileName);
    return response;
  }

  static async verifyUploadExcel(
    request,
    demandStackId,
    demandScenarioDetails
  ) {
    await this.lockUnlockDemandScenario(request, "lock", demandStackId);
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationsData.demandStacksEndpoint}${demandStackId}`;
    const payload = {
      layers: [
        {
          layerType: "UPLOAD",
          forecastVersion:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
          userId: "user",
          file: dataStream.excelEncodedData,
          isConfirmed: true,
          fileType: "xlsx",
          layerName: allocationsData.layerName,
          layerDescription: allocationsData.layerName,
        },
      ],
    };
    this.headers["Connection"] = "keep-alive";
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    return await response.json();
  }

  static async updateDescriptionApi(
    request,
    demandStackId,
    demandScenarioDetails,
    layerId
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationsData.demandStacksEndpoint}${demandStackId}`;
    const payload = {
      layers: [
        {
          layerId: layerId,
          allocationType: "DOLLAR",
          layerType: "UPLOAD",
          layerName: "test automation update",
          layerDescription: "test automation update",
          forecastVersion:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
          isConfirmed: true,
        },
      ],
      baseURL: "",
    };
    // API Request
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    return response;
  }

  static async deleteUploadLayer(request, demandStackId, layerId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandStackId}/layer/${layerId}`;
    // API Request
    const response = await request.delete(endpointURL, {
      headers: this.headers,
    });
    return response;
  }

  static async getLayerData(request, layerId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationsData.getLayerDataEndpoint}${layerId}`;
    // API Request
    const response = await request.get(endpointURL, {
      headers: this.headers,
    });
    return await response.json();
  }
}
