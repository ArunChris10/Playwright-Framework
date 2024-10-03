import debug from "debug";
import fs from "fs";
import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import filterData from "../testdata/filter-service.json";
import hisTestdatafile from "../testdata/historical-forecast.json";
import inputNodes from "../testdata/inputnodes.json";
import endpoints from "../testdata/statusendpoints.json";

export class UfmUtility {
  private static readonly mappingfilepath: string =
    "./tests/ufm-be/constants/mapping.json";
  /**
   * This method will get all the current forecast for BA and assert the response
   *
   * @param {string} lobName - the name of the line of business
   * @param {Request} request - the request object
   * @returns {Promise<Array<object>>} - the current forecast list
   */
  static async getCurrentForecastList(lobName, request) {
    //Making the get call to create forecast
    Utility.logIt(`Getting current forecast list for lob : ${lobName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
    Utility.logIt(endpointURL);
    const response = await request.post(endpointURL, {
      data: {
        unit: "Millions",
        dim_id: commonData.ba_dim_id,
        dim_val_id: await UfmUtility.getMapping(lobName, "org_id"),
        classification_id: commonData.classification_id,
        template_id: 1,
        filters: [],
        additional_filters: {
          template_include_headers: [
            {
              name: "vs LY",
              format: "percent",
            },
            {
              name: "vs Plan",
              format: "absolute",
            },
          ],
        },
      },
    });

    //asserting the response
    let responseBody = await Utility.assertAndLog(response);

    //returning the current forecast list
    return responseBody.rowData;
  }

  /**
   * This method will create filter
   *
   * @param {object} payload - the payload for creating the filter
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async createFilter(payload, request) {
    //Making the get call to create filter
    const endpointURL = `${process.env.apiBaseURLUFM}${filterData.endpoint}`;
    Utility.logIt(endpointURL);

    const response = await request.post(endpointURL, {
      data: payload,
    });

    let responseBody = await response.json();
    if (response.status === 200) {
      expect(responseBody.message).toEqual(filterData.success_message);
    } else if (
      response.status === filterData.duplicate_filter_name_response.status_code
    ) {
      expect(responseBody.message).toEqual(
        filterData.duplicate_filter_name_response.message
      );
    }

    debug.log(JSON.stringify(responseBody));
    return responseBody;
  }

  /**
   * This method will fetch historical forecast based on the particular forecast name
   *
   * @param {string} forecastname - the name of the forecast
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async GetHistorical(forecastname: string, request) {
    let responseData, responseBody;

    const historicalEndpointURL = `${process.env.apiBaseURLUFM}${hisTestdatafile.endpoint}`;
    const body = hisTestdatafile.sba_datas.filter(
      (forecast) => forecast.forecastname === forecastname
    );

    responseData = await request.get(historicalEndpointURL, {
      params: {
        ...body["queryParams"],
      },
    });
    responseBody = await responseData.json();
    return responseBody;
  }

  /**
   * This method will list the progress tracker and give you status of LOB or BA based on which screen is passed in argument
   * Technically screen is BA screen or Segment finance screen
   *
   * @param {string} screen - the screen to get the progress tracker for
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getProgresstracker(screen, request) {
    let template_id, dim_id, dim_val_id;
    Utility.logIt(`Getting progress tracker for screen : ${screen}`);
    if (screen == "Segment_Finance") {
      template_id = commonData.Segment_Finance.template_id;
      dim_id = commonData.Segment_Finance.dim_id;
      dim_val_id = commonData.Segment_Finance.dim_val_id;
    } else {
      template_id = commonData.ba_template_id;
      dim_id = commonData.ba_dim_id;
      dim_val_id = await UfmUtility.getMapping(screen, "dim_val_id", "PBA");
    }
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: dim_id,
        dim_val_id: dim_val_id,
        template_id: template_id,
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  /**
   * This method will give details of BA from canned report screen
   *
   * @param {string} orgName - the name of the organization
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getIndividualstatus(orgName, request) {
    Utility.logIt(`Getting Individual status for org : ${orgName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.individual_status_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: commonData.ba_dim_id,
        dim_val_id: await UfmUtility.getMapping(orgName, "dim_val_id", "PBA"),
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  /**
   * This method will give you the scenario details if you pass the scenario id and current forecast list
   *
   * @param {Array<object>} forecast_list - the list of forecasts
   * @param {number} scenario_id - the id of the scenario
   * @returns {Promise<number>} - the scenario version
   */
  static async getScenarioDetails(forecast_list, scenario_id) {
    let scenarioDetails;
    Utility.logIt(`Getting Scenario version`);
    forecast_list.filter(function (i) {
      if (i["scenarioId"] == scenario_id) {
        scenarioDetails = i;
        return;
      }
    });
    return scenarioDetails;
  }

  /**
   * This method will give you the last locked scenario
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getLastLockedScenario(request) {
    Utility.logIt(`Getting last locked scenario`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.last_locked_scenario_endpoint}`;
    const response = await request.get(endpointURL, { params: null });

    let responseBody = await Utility.assertAndLog(response);

    return responseBody;
  }

  /**
   * This method will send LOB to BA review and BA to Segment review based on scenario id, dim val id and status passed
   *
   * @param {number} scenario_id - the id of the scenario
   * @param {number} scenario_version - the version of the scenario
   * @param {string} status - the status to send the scenario to
   * @param {number} dim_id - the id of the dimension
   * @param {number} dim_val_id - the id of the dimension value
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async sendToReview(
    scenario_id,
    scenario_version,
    status,
    dim_id,
    dim_val_id,
    request
  ) {
    Utility.logIt(`Sending scenario id : ${scenario_id} to status : ${status}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.review_endpoint}`;
    Utility.logIt(endpointURL);

    const queryParams = {
      scenario_id: scenario_id,
      scenario_version: scenario_version,
      status: status,
    };
    const response = await request.put(endpointURL, {
      params: queryParams,
      data: {
        dim_id: dim_id,
        dim_val_id: dim_val_id,
      },
    });
    //asserting the responseawait expect(response).toBeOK();
    let responseBody = await Utility.assertAndLog(response);
    await expect(responseBody).toEqual(endpoints.sendToReviewSuccessful);
  }

  /**
   * Retrieves the list of input nodes for a given line of business.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {Request} request - The request object.
   * @returns {Promise<string[]>} - A promise that resolves to an array of input node names.
   */
  static async getInputNodelist(lobName, request) {
    let inputnodes = new Map();
    const endpointURL = `${process.env.apiBaseURLUFM}${inputNodes.endpoint}`;

    Utility.logIt(`Find input nodes for ${lobName} scenario`);
    inputNodes.payloads.dim_val_id = await UfmUtility.getMapping(
      lobName,
      "dim_val_id"
    );
    const response = await request.post(endpointURL, {
      data: inputNodes.payloads,
    });
    // asserting the response
    await expect.soft(response).toBeOK();
    let responseBody = await response.json();
    responseBody.nodes.filter(function (i) {
      if (i["is_editable"] == true) {
        inputnodes.set(i["node_var_name"], i["node_grain"]);
      }
    });
    Utility.logIt(`No of input nodes for ${lobName} - ${inputnodes.size}`);
    return inputnodes;
  }

  /**
   * Retrieves the required data based on the given base data, text, and BA type.
   * text can be - childName , dim_val_id , org_id
   *
   * @param {string} base_data - The base data to search for.
   * @param {string} text - The text to search for.
   * @param {string} [BAtype="SBA"] - The BA type to search for.
   * @return {Promise<any>} The required data.
   */
  static async getMapping(base_data, text: string, BAtype = "SBA") {
    let required_data;
    let body = JSON.parse(fs.readFileSync(this.mappingfilepath, "utf8"));

    switch (text) {
      case "childName":
        body.filter(function (i) {
          if (i["child_id"] == base_data) {
            required_data = i["child_name"];
          }
        });
        break;
      case "dim_val_id":
        body.filter(function (i) {
          if (i["child_name"] == base_data && i["child_dim_name"] == BAtype) {
            required_data = i["child_id"];
          }
        });
        break;
      case "org_id":
        body.filter(function (i) {
          if (i["child_name"] == base_data && i["child_dim_name"] == BAtype) {
            required_data = i["parent_id"];
          }
        });
    }

    return required_data;
  }
}
