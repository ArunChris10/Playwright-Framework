import debug from "debug";
import archiveScenario from '../testdata/archive-scenario.json'
import currentDemandData from '../testdata/current-demand.json'
import getDemandScenario from '../testdata/get-demand-scenario-forecast.json'
import tagNotificationData from '../testdata/tag-notification.json'
import getCurrentDemandForecast from '../testdata/get-currentdemand-scenario-forecast.json'
import currentDemandSlotTestData from '../testdata/get-currentdemand-scenario-slot-forecast.json'
import filterScenarioCurrentDemand from '../testdata/filter-retention-current-demand.json'
import baseDSForecast from '../testdata/base-ds-forecast.json'
import { expect } from '../../common/fixtures/test-hook';
import scenario from '../testdata/scenario.json';
import { Utility } from "../../common/fixtures/utils";
import currentDemandExcelData from '../testdata/current-demand-excel-download.json'

export class CdfUtility {   
  
  static demandScenario = "demandscenario"
  static headers = {
    "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
    "WM_SVC.NAME": process.env.WM_SVC_NAME,
    "WM_SVC.ENV": process.env.envName
  }

   // This method will create the scenario and asserts the response
   static async createScenario(request){
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${CdfUtility.demandScenario}`;
    console.log(endpointURL);
    const response = await request.post(
        endpointURL,
  
        { data: archiveScenario.createScenarioPayload, headers: CdfUtility.headers }
      );
      let responseBody = await response.json();
      debug.log(JSON.stringify(responseBody));
      return responseBody.demandStackScenarioId;
  }
  
  static async deleteScenario(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    console.log(endpointURL);
    const response = await request.delete(
        endpointURL,
  
        { data: archiveScenario.createScenarioPayload, headers: CdfUtility.headers }
      );
  }

  static async archiveScenario(request) {
    const demandId = await CdfUtility.createScenario(request);
    const endpointURL = `${process.env.apiBaseURLCDF}${archiveScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    const response = await request.patch(
      endpointURL,
      { data: archiveScenario.archive_scenario_payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));
    expect(responseBody.demandStackScenarioId).toEqual(demandId);
    return responseBody;
  }

  static async unarchiveScenario(request) {
    const demandId = await CdfUtility.createScenario(request);
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

  static async createNewScenario(request){
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${CdfUtility.demandScenario}`;
    console.log(endpointURL);
    const response = await request.post(
        endpointURL,
  
        { data: archiveScenario.createScenarioPayload, headers: CdfUtility.headers }
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
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}${scenario.cloneScenarioPayload.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(
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
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${scenarioId}${scenario.cloneScenarioPayload.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(
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

  static async checkClonedJobStatus(request, scenarioId){  
    //check the job status
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    let jobStatus = { jobStatus: '' };
    while (jobStatus.jobStatus == '' || jobStatus?.jobStatus === 'Job Created') {
        jobStatus = await CdfUtility.jobStatusCheck(request, scenarioId);
        debug.log(jobStatus);
        await delay(10000);
      }
  }

  static async getDemandScenarioById(request, demandId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${getDemandScenario.endpoint}${demandId}`;
    debug.log(endpointURL);
    const response = await request.post(
      endpointURL,

      { data: getDemandScenario.payload, headers: CdfUtility.headers }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the scenario Id of the created forecast
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
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandData.statusEndpointPrefix}${archiveScenario.createScenarioPayload.forecastInfoDTO.forecastInfo.version}${currentDemandData.statusEndpointSuffix}`;

    const response = await request.get(
        endpointURL,
        { headers: CdfUtility.headers }
    )

    return response;
  }

  static async pollPublishData(request){
    let retryCount = 15;
    let statusResponse,statusResponseBody;
    while(retryCount > 0) {
        debug.log(retryCount);
        statusResponse = await CdfUtility.getFCPWritebackStatus(request);
        statusResponseBody = await statusResponse.json();
        if( statusResponseBody.jobStatus == currentDemandData.expected_status_response){
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        retryCount -= 1;
    }
    debug.log(statusResponseBody)
    return statusResponseBody;
  }


  // Method to get the current demand data
  static async currentDemand(request, slotId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandData.currentDemandEndpoint}${slotId}`;
    debug.log(endpointURL);

    const response = await request.post(
        endpointURL,
        { data: currentDemandData.currentDemandPayload, headers: CdfUtility.headers }
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
    const endpointURL = `${process.env.apiBaseURLCDF}${currentDemandExcelData.currentDemandEndpoint}${slotId}${suffix}`;
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
    expect(await currentDemandScenario.yearlyForecast).toHaveLength(14);
    CdfUtility.validateYearlyAndMerticData(currentDemandScenario);
  }

}