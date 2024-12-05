import { Utility } from "../../common/fixtures/utils";
import { expect } from "@playwright/test";
import testdatafile from "../testdata/metadata-service.json";
import configTestDataFile from "../testdata/getConfig.json";
import endpoints from "../testdata/statusendpoints.json";
import visualIndicator from "../testdata/visual-indicator-api.json";
import screenDetailConfig from "../testdata/screen-details-api.json";
import forecastCalendarData from "../testdata/forecast-calendar-api.json";
import commonData from "../constants/common.json";
import { UfmUtility } from "./ufm-utils";
import mappingDetailsEndpoint from "../testdata/mapping-api.json";
import filterMappingDetailsEndpoint from "../testdata/filter-mapping-api.json";
import forecastData from "../testdata/forecast-api.json";
import scenarioIds from "../testdata/scenarioIds.json";
import inputNodes from "../testdata/inputnodes.json";
import kpiData from "../testdata/getkpiforecast.json";

export class UfmPerfUtility {

  static async makeRequest(request, nexusTokens: string, method: 'GET' | 'POST', endpoint: string, data: any = {}, params: any = {}, isDeadline = false) {
    const url = `${process.env.apiBaseURLUFM}${endpoint}`;
    const headers = { Authorization: nexusTokens };
    Utility.logIt(`Calling ${method} endpoint: ${url}`);

    let response;
    if (method === 'GET') {
      response = await request.get(url, { headers, params });
    } else if (method === 'POST') {
      response = await request.post(url, { headers, data });
    }

    // If it's a deadline request, just return the response without logging or asserting
    if (isDeadline) {
      return response; // Return response directly for deadline method
    }

    // For all other methods, we can just log and assert the response
    await Utility.assertAndLog(response);
  }

  // Method to get API data for metadata or home dimension
  static async getApiData(request, nexusTokens: string, apiType: "metadata" | "homedimension") {
    let endpoint: string;
    let params: any = {};

    if (apiType === "metadata") {
      const testdata = testdatafile.configEndpoint;
      endpoint = testdata?.endpoint ? testdata.endpoint : "";
      if (!endpoint) {
        Utility.logIt("Metadata endpoint not found in the testdata.");
        return;
      }
    } else {
      endpoint = "/metadata/dimensions/mappings";
      params = { dimension_group_id: 7 };
    }

    return await this.makeRequest(request, nexusTokens, 'GET', endpoint, {}, params);
  }

  // Method to get configuration data
  static async getConfig(request, nexusTokens: string) {
    const endpoint = configTestDataFile.endpoint;
    for (const config_payload of configTestDataFile.config) {
      await this.makeRequest(request, nexusTokens, 'POST', endpoint, config_payload.query);
    }
  }

  // Method to get the last locked scenario
  static async getLastLocked(request, nexusTokens: string) {
    const endpoint = endpoints.last_locked_scenario_endpoint;
    return await this.makeRequest(request, nexusTokens, 'GET', endpoint);
  }

  // Method to get visual indicator data
  static async getVisualIndicator(request, nexusTokens: string) {
    const endpoint = visualIndicator.endpoint;
    const params = { classification_id: visualIndicator.classification_id };
    return await this.makeRequest(request, nexusTokens, 'GET', endpoint, {}, params);
  }

  // Method to get screen details
  static async getScreenDetails(request, nexusTokens: string) {
    const endpoint = screenDetailConfig.configEndpoint.endpoint;
    const params = {
      dim_id: screenDetailConfig.configEndpoint.dim_id,
      dim_val_id: screenDetailConfig.configEndpoint.dim_val_id,
    };
    return await this.makeRequest(request, nexusTokens, 'GET', endpoint, {}, params);
  }

  // Method to get the deadline date
  static async getDeadlineDate(request, nexusTokens: string) {
    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id: forecastCalendarData.getForecastCalendarPayload.classification_id,
      children: "true",
      published: "true",
    });

    const endpoint = `${forecastCalendarData.endpoint}deadlines?${params.toString()}`;
    const response = await this.makeRequest(request, nexusTokens, 'GET', endpoint, {}, {}, true);
    const responseBody = await response.json();
    expect(responseBody.calendar_id).not.toEqual(null);
  }

  // Method to get the current forecast
  static async getCurrentForecast(request, nexusTokens: string, lobName: string) {
    const endpoint = endpoints.get_report_endpoint;
    const data = {
      unit: "Millions",
      dim_id: commonData.ba_dim_id,
      dim_val_id: await UfmUtility.getMapping(lobName, "parent_id"),
      classification_id: commonData.classification_id,
      template_id: 1,
      filters: [],
      additional_filters: {
        template_include_headers: [
          { name: "vs LY", format: "percent" },
          { name: "vs Plan", format: "absolute" },
        ],
      },
    };

    return await this.makeRequest(request, nexusTokens, 'POST', endpoint, data);
  }

  // Method to get mapping details
  static async getMappingDetails(request, nexusTokens: string) {
    const endpoint = mappingDetailsEndpoint.endpoint;
    const params = { dimension_group_id: mappingDetailsEndpoint.dimension_group_id };
    return await this.makeRequest(request, nexusTokens, 'GET', endpoint, {}, params);
  }

  // Method to get progress status tracker
  static async getProgressStatusTracker(screen: string, request, nexusTokens: string) {
    const { template_id, dim_id, dim_val_id } = this.getProgressParams(screen);
    const endpoint = endpoints.get_report_endpoint;
    const data = {
      dim_id: dim_id,
      dim_val_id: dim_val_id,
      template_id: template_id,
      classification_id: commonData.classification_id,
    };

    return await this.makeRequest(request, nexusTokens, 'POST', endpoint, data);
  }

  // Helper method to get parameters for progress status tracker
  static getProgressParams(screen: string) {
    let template_id, dim_id, dim_val_id;
    if (screen === "Segment_Finance") {
      template_id = commonData.Segment_Finance.template_id;
      dim_id = commonData.Segment_Finance.dim_id;
      dim_val_id = commonData.Segment_Finance.dim_val_id;
    } else {
      template_id = commonData.ba_template_id;
      dim_id = commonData.ba_dim_id;
      dim_val_id = UfmUtility.getMapping(screen, "dim_val_id", "PBA");
    }
    return { template_id, dim_id, dim_val_id };
  }

  // Method to create a forecast
  static async getCreateForecast(request, nexusTokens: string, lobName: string, forecastName = "", isError = false) {
    const endpoint = forecastData.endpoint;
    const PrimaryId = process.env.envName + "Primary";
    let payload = {
      type: commonData.type,
      source: { scenarios: [{ scenario_id: scenarioIds.payloads[PrimaryId].scenario_id }] },
      name: `${lobName} Automation - `,
      classification_id: commonData.classification_id,
      dim_id: commonData.lob_dim_id,
      dim_val_id: await UfmUtility.getMapping(lobName, "dim_val_id"),
    };

    payload.name = forecastName || `${payload.name} ${new Date().toLocaleString()}`;
    return await this.makeRequest(request, nexusTokens, 'POST', endpoint, payload);
  }

  // Method to get filter mapping details
  static async getFilterMappingDetails(request, nexusTokens: string) {
    const endpoint = filterMappingDetailsEndpoint.endpoint;
    const params = {
      dim_id: filterMappingDetailsEndpoint.dim_id,
      dim_val_id: filterMappingDetailsEndpoint.dim_val_id,
      classification_id: filterMappingDetailsEndpoint.classification_id,
    };
    return await this.makeRequest(request, nexusTokens, 'GET', endpoint, {}, params);
  }

  // Method to get input nodes
  static async getInputNodes(lobName: string, request, nexusTokens: string) {
    const endpoint = inputNodes.endpoint;
    inputNodes.payloads.dim_val_id = await UfmUtility.getMapping(lobName, "dim_val_id");
    return await this.makeRequest(request, nexusTokens, 'POST', endpoint, inputNodes.payloads);
  }

  // Method to get KPI forecast list
  static async getKpiForecastList(request, nexusTokens: string) {
    const endpoint = kpiData.endpoint;
    return await this.makeRequest(request, nexusTokens, 'POST', endpoint, kpiData);
  }

  static async deleteTheForecastForParticularLob(request, nexusTokens,lobName, userId){
    const forecastList = new Map();
    let dimId = commonData.ba_dim_id;
    let dimValId = await UfmUtility.getMapping(lobName, "dim_val_id");
    let currentForecast = await UfmUtility.getCurrentForecastList(
      lobName,
      request
    );
    Utility.logIt(`Getting Scenario version and Scenario Id`);
    let lobId = await UfmUtility.getMapping(lobName, "dim_val_id");
    await currentForecast.filter(function (i) {
      if (
        i["owner"] == userId &&
        (i["forecastStatus"] == commonData.Draft ||
          i["forecastStatus"] == commonData.Change_Requested) &&
        i["lineOfBusiness"] == lobId
      ) {
        Utility.logIt(i["scenarioVersion"]);
        Utility.logIt(i["scenarioId"]);
        forecastList.set(i["scenarioId"], i["scenarioVersion"]);
      }
    });
    Utility.logIt(`Retrieved Scenario version and Scenario Id`);
    for (let [scenarioId, scenarioVersion] of forecastList) {
      await this.deleteForecasts(nexusTokens,
        scenarioId,
        scenarioVersion,
        dimId,
        dimValId,
        request
      );
      Utility.logIt(
        `Forecast deleted for scenario id : ${scenarioId} and scenario version : ${scenarioVersion}`
      );
    }
  }

  static async deleteForecasts(nexusTokens: string,
    scenario_id,
    scenario_version,
    dimId,
    dimValId,
    request,
    isError = false
  ) {
    const param = scenario_id + "/" + scenario_version;
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}${param}`;
    const payload = {
      dim_id: dimId,
      dim_val_id: dimValId,
    };
    const response = await request.delete(endpointURL, { data: payload ,
      headers : { Authorization: nexusTokens },
    });
    let forecastDeleted = await Utility.assertAndLog(response, isError);

    if (!isError) {
      Utility.logIt(
        `Forecast is deleted  : ${JSON.stringify(forecastDeleted)}`
      );
      let message = forecastData.deleteMessage.replace(
        "scenario_id",
        scenario_id
      );
      expect(forecastDeleted.message).toEqual(message);
    }

    return forecastDeleted;
  }

  static async getTheIndividualstatus(orgName, request, nexusTokens) {
    Utility.logIt(`Getting Individual status for org : ${orgName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.individual_status_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: commonData.ba_dim_id,
        dim_val_id: await UfmUtility.getMapping(orgName, "dim_val_id", "PBA"),
        classification_id: commonData.classification_id,
      },
      headers: {
        Authorization: nexusTokens,
      },
    });

    return await Utility.assertAndLog(response);
  }
  
}