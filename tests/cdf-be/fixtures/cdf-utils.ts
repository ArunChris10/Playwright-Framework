import debug from "debug";
import archiveScenario from '../testdata/archive-scenario.json'
import cdfFilter from "../testdata/cdfFilter.json";
import currentDemandData from '../testdata/current-demand.json'
import getDemandScenario from '../testdata/get-demand-scenario-forecast.json'
import getDemandScenarioFilterRetention from '../testdata/get-demand-scenario-forecast-filter-retention.json'
import tagNotificationData from '../testdata/tag-notification.json'
import getCurrentDemandForecast from '../testdata/get-currentdemand-scenario-forecast.json'
import currentDemandSlotTestData from '../testdata/get-currentdemand-scenario-slot-forecast.json'
import filterScenarioCurrentDemand from '../testdata/filter-retention-current-demand.json'
import baseDSForecast from '../testdata/base-ds-forecast.json'
import { expect } from '../../common/fixtures/test-hook';
import scenario from '../testdata/scenario.json';
import { Utility } from "../../common/fixtures/utils";
import currentDemandExcelData from '../testdata/current-demand-excel-download.json'
import demandworkspace from '../testdata/get-dssorder.json'
import forecastinfolist from '../testdata/getlist-and-title.json'
import commonDemandEndpoints from '../testdata/common-demand-endpoints.json';
import demandStackScenarioTotalList from '../testdata/demand-stack-scenarios-total-list.json'
import getDemandScenarioCSV from '../testdata/get-demand-scenario-forecast-csv.json'
import { APIRequestContext, APIResponse } from "@playwright/test";
import type { PostArchiveDemandScenarioResponse } from "../types/post-archive-demand-scenario-response";
import { Forecast } from "../types/get-demand-scenario-forecast-response";
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';

export class CdfUtility {   
  
  static demandScenario = "demandscenario"
  static headers = {
    "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
    "WM_SVC.NAME": process.env.WM_SVC_NAME,
    "WM_SVC.ENV": process.env.envName
  }
  static createScenarioPayload;
  static async getDemandScenarioList(request){
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}`;
    console.log("endpointURL = " + endpointURL);
    this.headers["Connection"] = "keep-alive";
    const response = await request.get(
      endpointURL,
      { headers: CdfUtility.headers }
    );
      const demandScenarioDetails = await response.json();
      return demandScenarioDetails[0].forecastInfoDTO.forecastInfo;
  }
   // This method will create the scenario and asserts the response
   static async createScenario(request): Promise<string> {
    const forecastInfo = await this.getDemandScenarioList(request)
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${CdfUtility.demandScenario}`;
    console.log(endpointURL);
    const scenarioNameAutomation = "Reg - AutoTest - " + Date.now();
    const scenarioDescriptionAutomation = "Description - " + scenarioNameAutomation;
    this.createScenarioPayload = {
      forecastInfoDTO: {
        forecastInfo: {
          id: forecastInfo.id,
          version: forecastInfo.version
        },
      },
      title: scenarioNameAutomation,
      description: scenarioDescriptionAutomation,
    };
    const response = await request.post(
        endpointURL,
        { data: this.createScenarioPayload, headers: CdfUtility.headers }
      );
      let responseBody = await response.json();
      console.log(JSON.stringify(responseBody));
      return responseBody.demandStackScenarioId as string;
  }

  static async createScenarioByOtherUser(request, user){
    const forecastInfo = await this.getDemandScenarioList(request)
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${CdfUtility.demandScenario}`;
    console.log(endpointURL);
    const scenarioNameAutomation = "Reg - AutoTest - " + Date.now();
     const scenarioDescriptionAutomation = "Description - " + scenarioNameAutomation;
    this.createScenarioPayload = {
      forecastInfoDTO: {
        forecastInfo: {
          id: forecastInfo.id,
          version: forecastInfo.version,
        },
      },
      title: scenarioNameAutomation,
      description: scenarioDescriptionAutomation,
    }

    let token = await this.fetchTokenByUser(request, user);

    let CDFUpdatedHeaders = { 
      ...CdfUtility.headers, 
      "Authorization": `Bearer ${token}`
    }

    const response = await request.post(
        endpointURL,
  
        { data: this.createScenarioPayload, headers: CDFUpdatedHeaders }
      );
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));
      return responseBody.demandStackScenarioId;
  }
  
  static async deleteScenario(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    console.log("Delete scenario endpoint url" + endpointURL);
    const response = await request.delete(
        endpointURL,
  
        { data: this.createScenarioPayload, headers: CdfUtility.headers }
      );
      return response;
  }

  static async deleteScenarioByOtherUser(request: APIRequestContext, demandId: string, user: string): Promise<APIResponse> {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    debug.log("Delete scenario endpoint url" + endpointURL);
    
    let token = await this.fetchTokenByUser(request, user);

    let CDFUpdatedHeaders = { 
      ...CdfUtility.headers, 
      "Authorization": `Bearer ${token}`
    }
    const response = await request.delete(
        endpointURL,
  
        { data: this.createScenarioPayload, headers: CDFUpdatedHeaders }
      );
      return response;
  }

  static async archiveScenario(request: APIRequestContext, demandId: string): Promise<PostArchiveDemandScenarioResponse> {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    const response = await request.patch(
      endpointURL,
      { data: archiveScenario.archive_scenario_payload, headers: CdfUtility.headers }
    );
    //asserting the response
    await expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));
    expect(responseBody.demandStackScenarioId).toEqual(demandId);
    return responseBody;
  }

  static async unarchiveScenario(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    const response = await request.patch(
      endpointURL,

      { data: archiveScenario.unarchive_scenario_payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));
    expect(responseBody.demandStackScenarioId).toEqual(demandId);
    return responseBody;
  }

  static async archiveScenarioNormalUser(request, demandId, user) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    debug.log(endpointURL);

    let token = await this.fetchTokenByUser(request, user);

    let CDFUpdatedHeaders = { 
      ...CdfUtility.headers, 
      "Authorization": `Bearer ${token}`
    }

    const response = await request.patch(
      endpointURL,
      { data: archiveScenario.archive_scenario_payload, headers: CDFUpdatedHeaders }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));
    expect(responseBody.demandStackScenarioId).toEqual(demandId);
    return responseBody;
  }

  static async getDssInfo(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${baseDSForecast.endpoint}${demandId}`;
    debug.log(endpointURL);
    const response = await request.get(endpointURL, {
      data: this.createScenarioPayload,
      headers: CdfUtility.headers,
    });
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));
    expect(responseBody.demandStackScenarioId).toEqual(demandId);
    return responseBody;
  }

  static async unarchiveScenarioNormalUser(request, demandId, user) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    debug.log(endpointURL);

    // API Request
    let token = await this.fetchTokenByUser(request, user);

    let CDFUpdatedHeaders = { 
      ...CdfUtility.headers, 
      "Authorization": `Bearer ${token}`
    }
    
    const response = await request.patch(
      endpointURL,

      { data: archiveScenario.unarchive_scenario_payload, headers: CDFUpdatedHeaders }
    );

    return response;
  }
  
  static async getDemandScenario(request, payload) {
    const demandId = await CdfUtility.createScenario(request);
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    const response = await request.post(
      endpointURL,

      { data: payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the scenario Id of the created forecast
    return responseBody
  }

  static async fetchFilterDataFromEndpoint(request) {
    const endpointURL = `${process.env.apiBaseURLCDF}${cdfFilter.endpoint}`;
    const response = await request.get(endpointURL, {
      data: cdfFilter.channelGroupToBaseChannelMap_payload,
      headers: CdfUtility.headers,
    });
    expect(response).toBeOK();
    const data = await response.json();
    return data;
  }

  static async createNewScenario(request){
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${CdfUtility.demandScenario}`;
    console.log(endpointURL);
    const response = await request.post(
        endpointURL,
  
        { data: this.createScenarioPayload, headers: CdfUtility.headers }
      );
      expect(response).toBeOK();
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));
      return responseBody;
  }   
  

  static async cloneToNewScenario(request,scenarioId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}${scenario.cloneScenarioPayload.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(
      endpointURL,
      { data: scenario.cloneScenarioPayload.data1 , headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the response of the created scenario
    return responseBody;
  }
  

  static async cloneToNewScenarioWithLayers(request,scenarioId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}${scenario.cloneScenarioPayload.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(
      endpointURL,
      { data: scenario.cloneScenarioPayload.data2 , headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the response of the created scenario
    return responseBody;
  }

  static async freezeScenario(request,scenarioId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}`;
    debug.log(endpointURL);
    const response = await request.patch(
      endpointURL,
      { data: scenario.freezeScenarioPayload , headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the response 
    return responseBody;
  }

  static async UnFreezeScenario(request,scenarioId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}`;
    debug.log(endpointURL);
    const response = await request.patch(
      endpointURL,
      { data: scenario.UnfreezeScenarioPayload , headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the response 
    return responseBody;
  }

  static async jobStatusCheck(request, scenarioId){
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}${scenario.jobStatusPayload.endpoint}`;
    debug.log(endpointURL);
    const response = await request.get(
      endpointURL,
      { headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the response 
    return responseBody;

  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async checkClonedJobStatus(request, scenarioId){  
    //check the job status
    let jobStatus = { jobStatus: '' };
    while (jobStatus.jobStatus == '' || jobStatus?.jobStatus === 'Job Created') {
        jobStatus = await CdfUtility.jobStatusCheck(request, scenarioId);
        debug.log(jobStatus);
        await this.delay(10000);
      }
  }
  
  static async getDemandScenarioById(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
    console.log(endpointURL);

    let forecastVersion = await CdfUtility.getDemandScenarioList(request);
    forecastVersion = forecastVersion.version;
    console.log("Forecast Version: ", forecastVersion);

    let forecastInfoResponse;
    forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);

    let forecastInfoResponseBody;
    forecastInfoResponseBody = await forecastInfoResponse.json();

    // Fetch the layerId for the forecast version of the DSS created 
    let forecastLayerId;
    forecastInfoResponseBody.forEach(function(forecastInfo) {
        if(forecastInfo.version == forecastVersion) {
            forecastLayerId = forecastInfo.forecastLayerId;
        }
    });

    // Get the demand scenario details before creating the layers using `get-demand-scenario-forecast` api
    getDemandScenario.payload.version = forecastVersion;
    getDemandScenario.payload.layerIds[0] = forecastLayerId;

    const response = await request.post(
      endpointURL,

      { data: getDemandScenario.payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();

    //returning the scenario Id of the created forecast
    return responseBody;
  }
  static async getDemandScenarioByIdBeforeFilterSave(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    let payload = getDemandScenario.payloadWithFilterBeforeSave;
    payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
    const response = await request.post(
      endpointURL,

      { data: payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    // debug.log(JSON.stringify(responseBody));

    //returning the scenario Id of the created forecast
    return responseBody;
  }
  static async getDemandScenarioByIdWithFilters(request, demandId,sbu,sbuIds) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    let payload = getDemandScenario.payloadWithFilter;
    payload.sbu = sbu;
    payload.sbuIds = sbuIds;
    payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
    const response = await request.post(
      endpointURL,

      { data: payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    //returning the scenario Id of the created forecast
    return responseBody;
  }
  static async saveUserProfileFilter(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenarioFilterRetention.endpoint}${demandId}${"/filter"}`;
    debug.log(endpointURL);
    const response = await request.put(
      endpointURL,

      { data: getDemandScenarioFilterRetention.saveFilterPayload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();

    //returning the scenario Id of the created forecast
    return responseBody;
  }

  static async fetchUserProfileFilter(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenarioFilterRetention.endpoint}${demandId}${"/filter?isCurrentDemand=false"}`;
    debug.log(endpointURL);
    const response = await request.get(
      endpointURL,

      { data: getDemandScenarioFilterRetention.fetchFilterPayload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();

    //returning the scenario Id of the created forecast
    return responseBody;
  }
  

  static async getDemandScenarioByIdCSV(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenarioCSV.endpoint}${demandId}${"/csv"}`;
    let payload = getDemandScenarioCSV.payload
      payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
    const response = await request.post(
      endpointURL,

      { data: getDemandScenarioCSV.payload, headers: CdfUtility.headers }
    );

    //asserting the response
    expect(response).toBeOK();
    return response;
  }
  static async getDemandScenarioByIdChannelCSV(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenarioCSV.endpoint}${demandId}${"/csv"}`;
    let payload = getDemandScenarioCSV.payloadChannelCSV
      payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
    const response = await request.post(
      endpointURL,

      { data: getDemandScenarioCSV.payload, headers: CdfUtility.headers }
    );

    //asserting the response
    expect(response).toBeOK();
    return response;
  }

    static async getDemandScenarioByIdWithMinimumDataPayload(request, demandId, payloadExtension: Object = {}) {
      const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
      debug.log(endpointURL);
      let payload = getDemandScenario.payloadWithMinimumData
      payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
      const response = await request.post(
        endpointURL,

        { data: { ...payload, ...payloadExtension }, headers: CdfUtility.headers }
      );
      //asserting the response
      expect(response).toBeOK();
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));

      //returning the scenario Id of the created forecast
      return responseBody;
    }

    static async getDemandScenarioByIdAndPayload(request, demandId, payload) {
        const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
        debug.log(endpointURL);
        const response = await request.post(endpointURL, {
            data: payload,
            headers: CdfUtility.headers,
        });
        //asserting the response
        expect(response).toBeOK();
        let responseBody = await response.json();
        debug.log(JSON.stringify(responseBody));
        return responseBody;
    }

  // Method to publish DSS
  static async publishDSS(request, demandId, slotId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandData.publishEndpointPrefix}${demandId}${currentDemandData.publishEndpointSuffix}${slotId}/`;
    debug.log(endpointURL);

    const response = await request.post(
        endpointURL,
        { data: currentDemandData.payload, headers: CdfUtility.headers }
    )

    return response;
  }

  // Method to fetch the publish status
  static async getFCPWritebackStatus(request) {
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandData.statusEndpointPrefix}${this.createScenarioPayload.forecastInfoDTO.forecastInfo.version}${currentDemandData.statusEndpointSuffix}`;

    const response = await request.get(
        endpointURL,
        { headers: CdfUtility.headers }
    )

    return response;
  }

  static async pollPublishData(request){
    let retryCount = 45;
    let statusResponse,statusResponseBody;
    while(retryCount > 0) {
        debug.log(retryCount);
        statusResponse = await CdfUtility.getFCPWritebackStatus(request);
        statusResponseBody = await statusResponse.json();
        if( statusResponseBody.jobStatus == currentDemandData.expected_status_response){
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
        retryCount -= 1;
    }
    debug.log(statusResponseBody)
    return statusResponseBody;
  }


  // Method to get the current demand data on the basis of slot id
  static async currentDemand(request, slotId:number) {
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandData.currentDemandMultipleDSSEndpoint}${slotId}`;
    debug.log(endpointURL);

    const response = await request.post(
        endpointURL,
        { data: currentDemandData.currentDemandPayload, headers: CdfUtility.headers }
    )

    return response;
  }

   static async getCurrentDemandBySlotIdWithMinimumDataPayload(request, slotId) {
      const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandData.currentDemandMultipleDSSEndpoint}${slotId}`;
      debug.log(endpointURL);
      let payload = currentDemandData.payloadWithMinimumData
      payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
      const response = await request.post(
          endpointURL,
          { data: payload, headers: CdfUtility.headers }
      )

      return response;
    }

  static async saveFiltersSaved(request, demandId, filtersData) {
    const endpointURL = `${process.env.apiBaseURLCDF}${filtersData.endpoint}${demandId}/filter`;
    debug.log(endpointURL);

    const response = await request.put(
        endpointURL,
        { data: filtersData.saveFiltersPayload, headers: CdfUtility.headers }
    )
    return response;
  }

  // Method to get the current demand data
  static async currentDemandWithoutSlotId(request) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonDemandEndpoints.currentDemandEndpoint}`;
    debug.log(endpointURL);

    const response = await request.get(
        endpointURL,
        { headers: CdfUtility.headers }
    )

    return response;
  }
  static async getDemandScenarioByIdNonYOYCSV(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenarioCSV.endpoint}${demandId}${"/csv"}`;
    let payload = getDemandScenarioCSV.payload
    payload.version = this.createScenarioPayload.forecastInfoDTO.forecastInfo.version
    const response = await request.post(
      endpointURL,
  
      { data: getDemandScenarioCSV.payloadNonCSV, headers: CdfUtility.headers }
    );
  
    //asserting the response
    expect(response).toBeOK();
    return response;
  }
  

  static async fetchSlots(request){
      const endpointURL=`${process.env.apiBaseURLCDF}${currentDemandData.fetchSlotsEndpoints}`;
      debug.log(endpointURL);

      const response = await request.get(
      endpointURL,
      {headers: CdfUtility.headers}
      )
      return response;
  }
  static async checkFiltersSaved(request, demandId, filtersData) {
    const endpointURL = `${process.env.apiBaseURLCDF}${filtersData.endpoint}${demandId}/filter`;
    debug.log(endpointURL);

    const response = await request.get(
        endpointURL,
        { data: filtersData.getFiltersPayload, headers: CdfUtility.headers }
    )

    expect(response).toBeOK();
    let responseBody = await response.json();
    expect(filtersData.saveFiltersPayload).toEqual(responseBody);

    return response;
  }

  static async postComment(request) {
    const endpointURL = `${process.env.collaborationBaseURL}${tagNotificationData.postCommentEndpoint}`;
    debug.log(endpointURL);

    let token = await Utility.fetchIBGFakeToken(`${process.env.collaborationUser}`, request);

    let payload = tagNotificationData.postCommentPayload;

    payload.taggedUsers[0].userId = `${process.env.ibgUser}`;

    const response = await request.post(
        endpointURL,
        { data: payload, headers: {
          "Authorization": `Bearer ${token}`
        }}
    )

    return response;
  }

  static async getNotification(request) {
    const endpointURL = `${process.env.notificationBaseUrl}${tagNotificationData.getNotificationEndpoint}`;
    debug.log(endpointURL);

    let token = await Utility.fetchNexusFakeTokens(`${process.env.ibgUser}`, request);

    let payload = tagNotificationData.postCommentPayload;

    let headers_notification = {
      "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
      "WM_SVC.NAME": process.env.WM_SVC_NAME_NOTIFICATION,
      "WM_SVC.ENV": process.env.envName
    }

    payload.taggedUsers[0].userId = `${process.env.ibgUser}`;

    headers_notification["Authorization"] = `Bearer ${token}`;

    const response = await request.get(
        endpointURL,
        { data: payload, headers: headers_notification}
    )

    return response;
  }
  
  static async filterScenarioCurrentDemand(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}${filterScenarioCurrentDemand.endpoint}`;
    console.log(endpointURL);
    const response = await request.get(
      endpointURL,

      { headers: CdfUtility.headers});
    //returning the response of the created scenario
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the scenario Id of the created forecast
    return responseBody;
  }


  static async filterUpdateScenarioCurrentDemand(request, demandId, payload) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}${filterScenarioCurrentDemand.endpoint}`;
    debug.log(endpointURL);
    const response = await request.put(
      endpointURL,

      { data: payload, headers: CdfUtility.headers})
      expect(response).toBeOK();
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));
  
      //returning the scenario Id of the created forecast
      return responseBody;
  }


  static async getCurrentDemandForecast(request, payload) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getCurrentDemandForecast.endpoint}`;
    console.log(endpointURL);
    const response = await request.post(
      endpointURL,

      { data: payload, headers: CdfUtility.headers})
      expect(response).toBeOK();
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));
  
      //returning the scenario Id of the created forecast
      return responseBody;


  }

  static async downloadScenario(request, demandId, testdata) {
    const endpointURL = `${process.env.apiBaseURLCDF}${testdata.endpoint}${demandId}/excel`
    debug.log(endpointURL);
    const response = await request.post(
        endpointURL,
        { data: testdata.payload, headers: CdfUtility.headers }
    )
    expect(response).toBeOK();
    return response;

    
  }

  static async switchBaseDSResponse(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${baseDSForecast.endpoint}`;
    debug.log(endpointURL);
    debug.log(JSON.stringify({...baseDSForecast.switchBaseDSPayload, demandStackId: demandId}));
    const response = await request.put(
      endpointURL,
      { data: {...baseDSForecast.switchBaseDSPayload, demandStackId: demandId}, headers: CdfUtility.headers}
    )
    expect(response).toBeOK();
    return response;
  }


  static async currentDemandForMetric(request, slotId, metric, organizationalLevel, type) {
    let suffix;
        if (type === currentDemandExcelData.excelType){
            suffix = currentDemandExcelData.excelSuffix;
            currentDemandExcelData.currentDemandPayload.metricType = metric;
        }

        else if (type === currentDemandExcelData.csvType){
            suffix = currentDemandExcelData.csvSuffix;
            currentDemandExcelData.currentDemandPayload.metricType = metric;
        }
        else {
            suffix = "";
            currentDemandExcelData.currentDemandPayload.metricType = "";
        }
    const endpointURL = `${process.env.apiBaseURLCDF}${commonDemandEndpoints.currentDemandEndpoint}${slotId}${suffix}`;
    debug.log(endpointURL);
    currentDemandExcelData.currentDemandPayload.organizationalLevel = organizationalLevel;
    let response;
    CdfUtility.headers["Connection"] = "keep-alive";
    try{
        response = await request.post(
          endpointURL,
          { data: currentDemandExcelData.currentDemandPayload, headers: CdfUtility.headers, timeout: 100000 },
      )
    } catch(error) {
      debug.log("Error ", error.message)
    }

    return response;
  }


  static async getCurrentDemandSlotsForecast(request,slotId,viewType='SBU') {
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandSlotTestData.slotsEndpoint}/${slotId}`;
    const payload = {
      ...currentDemandSlotTestData.payload,
      organizationalLevel: viewType,
    }
    const response = await request.post(
      endpointURL,

      { data: payload, headers: CdfUtility.headers})
      expect(response).toBeOK();
      let responseBody = await response.json();  
      return responseBody;

  }
  static async validateYearlyAndMerticData(currentDemandScenario) {
    expect(
      await currentDemandScenario.yearlyForecast[0].forecast
    ).toHaveLength(11);
    currentDemandSlotTestData.metrics.forEach(async (metric) => {
      expect(
        await currentDemandScenario.yearlyForecast[0].forecast[0].hasOwnProperty(
          metric
        )
      ).toBeTruthy();
    });
  }
  static async validatePublishCurrentDemandSbuData(currentDemandScenario) {
    expect(await currentDemandScenario.yearlyForecast).toHaveLength(6);
    CdfUtility.validateYearlyAndMerticData(currentDemandScenario);
  }
  static async validatePublishCurrentDemandChannelData(currentDemandScenario) {
    expect(await currentDemandScenario.yearlyForecast).toHaveLength(16);
    CdfUtility.validateYearlyAndMerticData(currentDemandScenario);
  }

  static async assertAmountWithinTolerance(amount, aur, units) {
    const higherValue = (aur + 0.005) * units;
    const lowerValue = (aur - 0.005) * units;
    expect(amount).toBeGreaterThanOrEqual(lowerValue);
    expect(amount).toBeLessThanOrEqual(higherValue);
  }

  static async assertAurWithinTolerance(aur, amount, units) {
    const value = amount / units;
    expect(aur).toBeGreaterThanOrEqual(value - 0.005);
    expect(aur).toBeLessThanOrEqual(value + 0.005);
    
  }
  static async assertUnitsWithinTolerance(units, amount, aur) {
    const higherValue = amount / (aur - 0.005);
    const lowerValue =  amount / (aur + 0.005);
    expect(units).toBeGreaterThanOrEqual(lowerValue);
    expect(units).toBeLessThanOrEqual(higherValue);
  }

  static async verifyYoYPercentage(expected, current, past) {
    const expectedPercentage = (current - past) / (past / 100);
    expect(parseFloat(expectedPercentage.toFixed(2))).toBe(expected);
  }


  static async fetchallForecast(request) {
  const endpointURL = `${process.env.apiBaseURLCDF}${demandworkspace.endpoint}`;
    console.log(endpointURL);
    const response = await request.get(
      endpointURL,
      { headers: CdfUtility.headers});
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //fetch list of all demand stacks and then return response
    return responseBody;
  }

  
  static async forecastInfoList(request) {
    // forecast info api to fetch list of all forecast
    const endpointURL = `${process.env.apiBaseURLCDF}${forecastinfolist.endpoint}`;
      console.log(endpointURL);
      const response = await request.post(
        endpointURL,
  
        { data: forecastinfolist.payload, headers: CdfUtility.headers})
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));
  
      return responseBody;
    }

  static async assertFY2020WithinTolerance(containsFY2020: any) {
    expect(containsFY2020).toEqual(true);
  }

  static async fetchTokenByUser(request, user) {
    let token = await Utility.getNexusFakeToken(user + "", request);

    token = token.replace("\"","");
    token = token.replace("\"","");

    return token;
  }

  static async getActivityLogs(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonDemandEndpoints.getActivityLogs}${demandId}`;
    console.log("Endpoint URL for Activity Logs: ", endpointURL);

    // API Request
    const response = await request.get(
      endpointURL,
      { headers: CdfUtility.headers }
    );

    expect(response).toBeOK();
    const responseBody = await response.json();
    return responseBody;
  }

  static async getActivityLogsStatus(request, demandId, message) {
    let activityLogsResponse;

    let retryCount = 5;

    let startCount = 0;

    while(startCount <= retryCount) {
      activityLogsResponse = await CdfUtility.getActivityLogs(request, demandId);
      debug.log("Activity Logs Response: ", activityLogsResponse);
      if(activityLogsResponse.length != 0) {
        let sortedActivityLogsResponseDesc = activityLogsResponse.sort((a, b) => {
          const dateA = new Date(a.lastModified);
          const dateB = new Date(b.lastModified);
          return dateB.getTime() - dateA.getTime();
        });
        if(sortedActivityLogsResponseDesc[0].action === message) {
          return activityLogsResponse;
        }
      }
      startCount += 1;
      await this.delay(10000);
    }

    return null;
  }

  static async getDemandScenarioListForArchiveAndUnarchive(request, endpoint) {
    const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}`;
    console.log("Endpoint URL for getDemandScenarioList: ", endpointURL);

    // API Request
    const response = await request.get(
      endpointURL,
      { headers: CdfUtility.headers }
    );

    expect(response).toBeOK();
    const responseBody = await response.json();
    return responseBody;
  }


  static async updateActivityLogsComment(request, currentLayerId, comment) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonDemandEndpoints.getActivityLogs}${currentLayerId}`;
    console.log("Endpoint URL for updateActivityLogsComment: ", endpointURL);

    await request.put(endpointURL, {
      data: { comment },
      headers: CdfUtility.headers,
    });
  }

  static async getDemandStackScenarioTotalList(request, isArchived ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${demandStackScenarioTotalList.endpoint}?isArchive=${isArchived}`;
    console.log("Endpoint URL for getDemandStackScenarioTotalList: ", endpointURL);
   
    // API Request
    const response = await request.get(
      endpointURL,
      { headers: CdfUtility.headers }
    )
    
    expect(response).toBeOK();
    const responseBody = await response.json();
    return responseBody

  }
  static async getAllDSSList(request, payload) {
    const endpointURL = `${process.env.apiBaseURLCDF}${payload.endpoint}`;
    //console.log(endpointURL);
    
    const response = await request.post(
      endpointURL,

      { data: payload, headers: CdfUtility.headers})
      expect(response).toBeOK();
      let responseBody = await response.json();
      //console.log(JSON.stringify(responseBody));
  
      return responseBody;


  }

  static async getDemandScenarioForecast(request, demandStackId, payload) {
    const endpointURL = `${process.env.apiBaseURLCDF}${payload.endpoint}${demandStackId}`;

    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    let responseBody = await response.json();
    //debug.log(JSON.stringify(responseBody));
    return await response.json();
  }

  static getMatchedDss(dssList, dssId) {
    for (let i = 0; i < dssList.length; i++) {
      if(dssList[i]["demandStackScenarioId"] === dssId) {
        return dssList[i];
      }
    }
  }


  static async verifyForecastAggregationWithMinimumDataPayload(request, demandId, layerId?: string) {
      let forecast;

      const payloadExtension = {
        layerIds: layerId ? [layerId] : [],
        metricType: "GMV Shipped",
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
      };
      forecast = (
        await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
          request,
          demandId,
          payloadExtension
        )
      ).forecastTotals.grandTotal.forecast;
      const start = {
        month: forecast[0].month,
        quarter: forecast[0].quarter,
        year: forecast[0].year,
      };
      const end = {
        month: forecast[forecast.length - 1].month,
        quarter: forecast[forecast.length - 1].quarter,
        year: forecast[forecast.length - 1].year,
      };
      const totalValue =
        Math.round(forecast.reduce((a, b) => a + b.amount, 0) * 100) / 100;

      payloadExtension.timeFilter.filterLevel = "YEAR";
      forecast = (
        await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
          request,
          demandId,
          payloadExtension
        )
      ).forecastTotals.grandTotal.forecast;
      expect(forecast[0].year).toEqual(start.year);
      expect(forecast[forecast.length - 1].year).toEqual(end.year);
      expect(
        Math.round(forecast.reduce((a, b) => a + b.amount, 0) * 100) / 100
      ).toEqual(totalValue);

      payloadExtension.timeFilter.filterLevel = "QUARTER";
      forecast = (
        await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
          request,
          demandId,
          payloadExtension
        )
      ).forecastTotals.grandTotal.forecast;
      expect(forecast[0].quarter).toEqual(start.quarter);
      expect(forecast[0].year).toEqual(start.year);
      expect(forecast[forecast.length - 1].quarter).toEqual(end.quarter);
      expect(forecast[forecast.length - 1].year).toEqual(end.year);
      expect(
        Math.round(forecast.reduce((a, b) => a + b.amount, 0) * 100) / 100
      ).toEqual(totalValue);
    }

    static async verifyGMVMixPercentage(forecast, forecastTotals, plusMinusMonths) {
      const currentDate = new Date();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      
      let sbuForecastSaleMixPercentage = forecast[0].forecast.filter(c=>c.year == year && c.month == month + plusMinusMonths).map(c=>c.forecastGrowth.saleMixPercentage);
      let sbuForecastGMV = forecast[0].forecast.filter(c=>c.year == year && c.month == month + plusMinusMonths).map(c=>c.amount);
      let sbuForecastGMVTotal = forecastTotals.forecast.filter(c=>c.year == year && c.month == month + plusMinusMonths).map(c=>c.amount);

      let gmvMixpercentage = parseFloat(((sbuForecastGMV / sbuForecastGMVTotal) * 100).toFixed(2));
      
      expect(sbuForecastSaleMixPercentage[0]).toEqual(gmvMixpercentage);
    }

    static getForecastByMonth(
        forecasts: Forecast[],
        { month, year }: { month: number, year: number }
    ): Forecast | null {
      const monthlyForecast = forecasts.filter((forecast) =>
        forecast.month === month && forecast.year === year
      )[0]

      return monthlyForecast || null
    }

    /**
 * Compares the values from an Excel download with the corresponding values from an API response.
 *
 * @param {number[]} excelValues - The values downloaded from the Excel file.
 * @param {number[]} currentDemandData - The corresponding values from the API response.
 * @param {number} allowedTolerance - The allowed tolerance for the comparison.
 */
static async compareExcelDownloadedValuesWithAPIResponse(
  excelValues,
  currentDemandData: number[],
  allowedTolerance: number = 0.5
) {
  for(let i=0 ,j=0; i<excelValues.length;i++){
    if(excelValues[i] != 0 && excelValues[i] != ''){
        expect(excelValues[i]).toBeGreaterThan(currentDemandData[j]-allowedTolerance);
        expect(excelValues[i]).toBeLessThan(currentDemandData[j]+allowedTolerance);
        j++
    }
    else{
        if(currentDemandData[j] == 0){
            expect(excelValues[i]).toEqual(currentDemandData[j])
            j++;
        }
    }
    
}
}
}

