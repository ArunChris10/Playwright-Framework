import debug from "debug";
import { DemandBaseClass } from "./demand-common-utils";
import adjustmentData from "../testdata/adjustment-layer-data.json";
import commonEndpoints from "../testdata/common-demand-endpoints.json";
import testDataForManage from '../testdata/manage-rebase.json';
import { expect } from "@playwright/test";
import allocationsData from "../testdata/allocation-layer-data.json";
import emtLayerUnitData from "../testdata/emt-layer-unit-data.json";
import currentDemandData from '../testdata/current-demand.json'
import emtLayerData from "../testdata/emt-layer-data.json";


export class AdjustmentUtility extends DemandBaseClass {
    static async createEMTLayer(request, demandId, testdatafileCreateEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileCreateEMT.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.put(
            endpointURL,
            { 
                data: testdatafileCreateEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async getEMTLayer(request, demandId, testdatafileGetEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileGetEMT.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileGetEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async editEMTLayer(request, demandId, testdatafileEditEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileEditEMT.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileEditEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async deleteEMTLayer(request, layerId, demandId, testdatafileDeleteEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileDeleteEMT.endpoint}${demandId}/layer/${layerId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.delete(
            endpointURL,
            { 
                data: testdatafileDeleteEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async createManualAdjustmentLayer(request, demandId, testdatafileCreateManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileCreateManualAdjustment.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.put(
            endpointURL,
            { 
                data: testdatafileCreateManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async getManualAdjustmentLayer(request, demandId, testdatafileGetManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileGetManualAdjustment.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileGetManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async editManualAdjustmentLayer(request, demandId, testdatafileEditManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileEditManualAdjustment.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileEditManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async deleteManualAdjustmentLayer(request, layerId, demandId, testdatafileDeleteManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileDeleteManualAdjustment.endpoint}${demandId}/layer/${layerId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.delete(
            endpointURL,
            { 
                data: testdatafileDeleteManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }


    static async getEmtLayerPercenatge(request, demandId, emtLayerPercenatge) {
      const endpointURL = `${process.env.apiBaseURLCDF}${emtLayerPercenatge.baseURL}${demandId}/percentageToAbsolute`;
      debug.log(endpointURL);

      // API Request
      const response = await request.put(
          endpointURL,
          { 
              data: emtLayerPercenatge.payload,
              headers: AdjustmentUtility.headers
          }
      );

      return response;
  }

  static async getAllDemandScenarioForecastData(
    request,
    demandStackId,
    demandScenarioDetails,
    sbuName = [],
    sbuIds = [],
    department = [],
    departmentIds = [],
    baseChannel = [],
    baseChannelIds = [],
    yearMonths = [],
    layerIds = []
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.getDemandScenarioForecastEndpoint}${demandStackId}`;
    const payload = {
      sbu: sbuName,
      sbuIds: sbuIds,
      department: department,
      departmentIds: departmentIds,
      baseChannel: baseChannel,
      baseChannelIds: baseChannelIds,
      channelGroup: [],
      channelGroupIds: [],
      demandChannel: [],
      layerIds: layerIds,
      clearAll: false,
      includeDerivedMetrics: true,
      includeTotals: false,
      organizationalLevel: null,
      loadHeirarchyParams: null,
      timeFilter: {
        filterLevel: adjustmentData.filterLevel,
        isYearSelected: false,
        isMonthSelected: false,
        isQuarterSelected: false,
        yearMonths: yearMonths,
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
      flattenHierarchy: true,
    };
    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static getInputValueForBaseForecast(value) {
    return -(value - (value/2));
  }

  static async updateDemandStacksData(
    request,
    demandStackId,
    demandScenarioDetails,
    sbuName,
    sbuId,
    department,
    departmentId,
    baseChannel,
    baseChannelIds,
    yearMonths,
    isSave,
    baseForecastData,
    allocationUnitType = null
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}`;
    const payload = {
      layers: [
        {
          layerType: "HIGHLIGHTER",
          allocationType: null,
          allocationUnitType: allocationUnitType,
          layerDescription: "test",
          layerName: "test automation",
          forecastVersion: demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
          isConfirmed: isSave,
          isPreview: !isSave,
          highlighterAllocationsList: [
            {
              sbu: sbuName,
              sbuId: sbuId,
              channels: baseChannel,
              amount: adjustmentData.forecastUpdatePayload.gmv,
              units: adjustmentData.forecastUpdatePayload.units,
              yearMonth: yearMonths,
              department: department,
              departmentId: departmentId,
              channelIds: baseChannelIds,
            },
          ],
        },
      ],
    };
    // API Request
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async editTitileDescriptionAdjustment(request, demandId, forecastVersion, title) {
    const endpointURL = `${process.env.apiBaseURLCDF}${testDataForManage.endpointForUpdateDemandScenarioBaseForecast}`;
    console.log("Endpoint URL for switchBaseDSResponse: ", endpointURL);

    testDataForManage.payloadForUpdateDemandScenarioBaseForecast.demandStackId = demandId;
    testDataForManage.payloadForUpdateDemandScenarioBaseForecast.forecastVersion = forecastVersion;
    testDataForManage.payloadForUpdateDemandScenarioBaseForecast.demandStackDesc = "test-description";
    testDataForManage.payloadForUpdateDemandScenarioBaseForecast.demandStackName = title;
    // API Request
    const response = await request.put(
        endpointURL,
        {
            data: testDataForManage.payloadForUpdateDemandScenarioBaseForecast,
            headers: this.headers
        }
    )
    expect(response).toBeOK();
    return await response.json();
}
  static async emtLayerAdjustment(request, demandStackId, demandScenarioDetails, allocationType, layername){
    // emtlayercreation endpoint
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationsData.demandStacksEndpoint}${demandStackId}`;
    const payload = emtLayerData;
    payload.layers[0].allocationType = allocationType;
    payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
    payload.layers[0].layerName = layername
    this.headers["Connection"] = "keep-alive";
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    return await response.json();
  }

  static async getForecastRange(request, version) {
      const endpoint = `${process.env.apiBaseURLCDF}${currentDemandData.statusEndpointPrefix}${version}/range`;
      const response = await request.get(endpoint, {
          headers: this.headers
      })
      expect(response).toBeOK();
      return await response.json();
  }

  static async percentageToAbsolute(request, demandId, payload, endPoint) {
    const endpoint = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandId}${endPoint}`;
    const response = await request.put(endpoint, {
      data: payload,
      headers: this.headers,
    });
    expect(response).toBeOK();
    return await response.json();
  }

}
