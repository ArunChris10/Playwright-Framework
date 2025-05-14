import { Utility } from "../../common/fixtures/utils";
import adjustmentData from "../testdata/allocationpayload.json";

export class DataScienceUtility {
  /**
   * Calls the get-data-science-info API and returns the first scenario's details.
   * @param {Request} request - The request object.
   * @returns An object containing scenario_id and scenario_version.
   */
  static async getDataScienceInfo(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}/scenario/data-science/info`;
    const payload = {
        "baseURL" : endpointURL
    }
    const response = await request.get(endpointURL, { data: payload });
    const responseBody = await Utility.assertAndLog(response);

    // Assume responseBody is an array; pick the first scenario.
    const scenario = responseBody[0];
    return { scenario_id: scenario.scenario_id, scenario_version: scenario.scenario_version };
  }

  /**
   * Calls the allocate-data API with dynamic scenario details and custom edits.
   * @param request - Playwright Request object.
   * @param scenario - Object with scenario_id and scenario_version.
   * @param editedEdits - Array of edits to override the default payload.
   * @returns The response from the allocate-data API.
   */
  static async allocateData(request, scenario_id , editedMonth , editedData): Promise<any> {
    const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;
    const payload = adjustmentData.allocation_request;
    payload.scenario_id = scenario_id;
    payload.edits[0].node_var_name = "grossgmv";
    payload.edits[0].data = {
        "202601" : editedData
    }
    payload.dim_id = 13;
    payload.dim_val_id=130001;
    const response = await request.post(endpointURL, { data: payload });
    const testPayload = payload;
    return await Utility.assertAndLog(response);
  }

//   /**
//    * Calls the adjustment API to save changes.
//    * @param request - Playwright Request object.
//    * @param scenario - Object with scenario_id and scenario_version.
//    * @param editedEdits - Array of edits to override the default payload.
//    * @returns The response from the adjustment API.
//    */
//   static async saveAdjustment(request: Request, scenario: { scenario_id: number; scenario_version: number }, editedEdits: any[]): Promise<any> {
//     const endpointURL = dataSciencePayloads.adjustment.baseURL;
//     const payload = { ...dataSciencePayloads.adjustment.payload };

//     // Update dynamic values in the metadata and allocation request
//     payload.adjustment_metadata.scenario_id = scenario.scenario_id;
//     payload.adjustment_metadata.scenario_version_timestamp = scenario.scenario_version;
//     payload.allocation_request.scenario_id = scenario.scenario_id;
//     payload.allocation_request.edits = editedEdits;

//     const response = await request.post(endpointURL, { data: payload });
//     return await Utility.assertAndLog(response);
//   }

//   /**
//    * Calls the get-mykpi API to retrieve KPI data.
//    * @param request - Playwright Request object.
//    * @param scenario - Object with scenario_id and scenario_version.
//    * @returns The response from the get-mykpi API.
//    */
//   static async getMyKpi(request: Request, scenario: { scenario_id: number; scenario_version: number }): Promise<any> {
//     const endpointURL = dataSciencePayloads.getMyKpi.baseURL;
//     const payload = { ...dataSciencePayloads.getMyKpi.payload };

//     // Update dynamic scenario values
//     payload.scenario_id = scenario.scenario_id;
//     payload.scenario_version = scenario.scenario_version;

//     const response = await request.post(endpointURL, { data: payload });
//     return await Utility.assertAndLog(response);
//   }
}
