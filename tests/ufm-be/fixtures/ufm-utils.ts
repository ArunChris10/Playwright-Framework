import debug from "debug";
import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import adjustmentData from "../testdata/adjustment.json";
import filterData from "../testdata/filter-service.json";
import forecastData from "../testdata/forecast-api.json";
import hisTestdatafile from "../testdata/historical-forecast.json";
import inputNodes from "../testdata/inputnodes.json";
import scenarioIds from "../testdata/scenarioIds.json";
import endpoints from "../testdata/statusendpoints.json";

export class UfmUtility {
  // This method will create the forecast and assert the response
  static async createForecast(lobName, request) {
    //Making the get call to create forecast
    Utility.logIt(`Creating Scenario for ${lobName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
    Utility.logIt(endpointURL);
    let payload = {
      type: commonData.type,
      source: {
        scenarios: [
          {
            scenario_id: scenarioIds.payloads.Primary.scenario_id,
          },
        ],
      },
      name: lobName + " Automation - ",
      classification_id: commonData.classification_id,
      dim_id: commonData.lob_dim_id,
      dim_val_id: commonData[lobName].dim_val_id,
    };

    payload.name = payload.name + new Date().toLocaleString();
    const response = await request.post(
      endpointURL,

      { data: payload }
    );
    //asserting the response
    let responseBody = await Utility.assertAndLog(response);
    expect
      .soft(responseBody.message)
      .toEqual(forecastData.createSuccessMessage);
    Utility.logIt(
      `Forecast is created for ${lobName}  : 
      ${responseBody.scenario.scenario_id}`
    );

    //returning the scenario Id of the created forecast
    return responseBody.scenario.scenario_id;
  }

  // This method will get all the current forecast for BA and assert the response
  static async getCurrentForecastList(lobName, request) {
    //Making the get call to create forecast
    Utility.logIt(`Getting current forecast list for lob : ${lobName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
    Utility.logIt(endpointURL);
    const response = await request.post(endpointURL, {
      data: {
        unit: "Millions",
        dim_id: commonData.ba_dim_id,
        dim_val_id: commonData[lobName].org_dim_val_id,
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

  //This method will create filter
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

  // This method will delete the forecast
  static async deleteForecast(
    scenario_id,
    scenario_version,
    dimId,
    dimValId,
    request
  ) {
    const param = scenario_id + "/" + scenario_version;
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}${param}`;
    const payload = {
      dim_id: dimId,
      dim_val_id: dimValId,
    };
    const response = await request.delete(endpointURL, { data: payload });
    let forecastDeleted = await Utility.assertAndLog(response);
    Utility.logIt(`Forecast is deleted  : ${JSON.stringify(forecastDeleted)}`);
    let message = forecastData.deleteMessage.replace(
      "scenario_id",
      scenario_id
    );
    expect(forecastDeleted.message).toEqual(message);
    return forecastDeleted;
  }

  //This method will fetch historical forecast based on the particular forecast name
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

  //This method will list the progress tracker and give you status of LOB or BA based on which screen is passed in argument
  //Technically screen is BA screen or Segment finance screen
  static async getProgresstracker(screen, request) {
    let template_id, dim_id;
    Utility.logIt(`Getting progress tracker for screen : ${screen}`);
    if (screen == "Segment_Finance") {
      template_id = commonData.Segment_Finance.template_id;
      dim_id = commonData.Segment_Finance.dim_id;
    } else {
      template_id = commonData.ba_template_id;
      dim_id = commonData.ba_dim_id;
    }
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: dim_id,
        dim_val_id: commonData[screen].dim_val_id,
        template_id: template_id,
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  //This method will give details of BA from canned report screen
  static async getIndividualstatus(orgName, request) {
    Utility.logIt(`Getting Individual status for org : ${orgName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.individual_status_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: commonData.ba_dim_id,
        dim_val_id: commonData[orgName].dim_val_id,
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  //This method will give you the scenario version if you pass the scenario id and current forecast list
  static async getScenarioVersion(forecast_list, scenario_id) {
    let scenarioVersion;
    Utility.logIt(`Getting Scenario version`);
    forecast_list.filter(function (i) {
      if (i["scenarioId"] == scenario_id) {
        Utility.logIt(i["scenarioVersion"]);
        scenarioVersion = i["scenarioVersion"];
      }
    });
    return scenarioVersion;
  }

  //This method will give you the last locked scenario
  static async getLastLockedScenario(request) {
    Utility.logIt(`Getting last locked scenario`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.last_locked_scenario_endpoint}`;
    const response = await request.get(endpointURL, { params: null });

    let responseBody = await Utility.assertAndLog(response);

    return responseBody;
  }

  //This method will send LOB to BA review and BA to Segment review based on scenario id , dim val id and status paased
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

  // This method creates adjustment
  static async createAdjustment(
    scenario_id,
    scenario_version,
    lobName,
    request
  ) {
    const endpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    Utility.logIt(`Create adjustment for ${lobName}`);
    adjustmentData.payloads.adjustment_metadata.adjustment_name =
      lobName + " Auto Adjustment " + new Date().toLocaleString();
    adjustmentData.payloads.adjustment_metadata.adjustment_reason =
      lobName + " Auto Adjustment Desc " + new Date().toLocaleString();
    adjustmentData.payloads.adjustment_metadata.scenario_id = scenario_id;
    adjustmentData.payloads.adjustment_metadata.scenario_version_timestamp =
      scenario_version;
    adjustmentData.payloads.allocation_request.scenario_id = scenario_id;

    const response = await request.patch(endpointURL, {
      data: adjustmentData.payloads,
    });

    // asserting the response
    let responseBody = await Utility.assertAndLog(response);
    await expect
      .soft(responseBody.message)
      .toEqual(adjustmentData.successMessage);
    await expect
      .soft(responseBody.adjustment_metadata.adjustment_name)
      .toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
    await expect
      .soft(responseBody.adjustment_metadata.adjustment_reason)
      .toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

    let adjustment_id = responseBody.adjustment_metadata.adjustment_id;
    return adjustment_id;
  }

  //This method gets the list of all input nodes for a particular lob
  static async getInputNodelist(lobName, request) {
    let inputnodes: string[] = [];
    const endpointURL = `${process.env.apiBaseURLUFM}${inputNodes.endpoint}`;

    Utility.logIt(`Find input nodes for ${lobName} scenario`);
    inputNodes.payloads.dim_val_id = commonData[lobName].dim_val_id;
    const response = await request.post(endpointURL, {
      data: inputNodes.payloads,
    });
    // asserting the response
    await expect.soft(response).toBeOK();
    let responseBody = await response.json();
    responseBody.nodes.filter(function (i) {
      if (i["is_editable"] == true) {
        inputnodes.push(i["node_var_name"]);
      }
    });
    Utility.logIt(`No of input nodes for ${lobName} - ${inputnodes.length}`);
    return inputnodes;
  }

  //This method will delete all forecast for a particular LOB created by user based on user id and Lob passed
  static async deleteAllforecastofUser(request, lobName, userId) {
    const forecastList = new Map();
    let dimId = commonData.ba_dim_id;
    let dimValId = commonData[lobName].dim_val_id;
    let currentForecast = await UfmUtility.getCurrentForecastList(
      lobName,
      request
    );
    Utility.logIt(`Getting Scenario version and Scenario Id`);
    await currentForecast.filter(function (i) {
      if (
        i["owner"] == userId &&
        (i["forecastStatus"] == commonData.Draft ||
          i["forecastStatus"] == commonData.Change_Requested) &&
        i["lineOfBusiness"] == commonData[lobName].dim_val_id
      ) {
        Utility.logIt(i["scenarioVersion"]);
        Utility.logIt(i["scenarioId"]);
        forecastList.set(i["scenarioId"], i["scenarioVersion"]);
      }
    });
    Utility.logIt(`Retrieved Scenario version and Scenario Id`);
    for (let [scenarioId, scenarioVersion] of forecastList) {
      await this.deleteForecast(
        scenarioId,
        scenarioVersion,
        dimId,
        dimValId,
        request
      );
      Utility.logIt(
        `Forecast deleted for scenario id : ${scenarioId} and scenario version : ${scenarioVersion}`
      );
      // return responseBody;
    }
  }
}
