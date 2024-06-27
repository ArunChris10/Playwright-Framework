import debug from "debug";
import archiveScenario from '../testdata/archive-scenario.json'
import getDemandScenario from '../testdata/get-demand-scenario-forecast.json'
import { expect } from '../../common/fixtures/test-hook';

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
  
  static async getDemandScenario(request) {
    const demandId = await CdfUtility.createScenario(request);
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
}