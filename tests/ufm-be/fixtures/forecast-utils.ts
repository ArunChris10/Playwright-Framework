import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import commonData from "../constants/common.json";
import forecastData from "../testdata/forecast-api.json";
import scenarioIds from "../testdata/scenarioIds.json";
import endpoints from "../testdata/statusendpoints.json";

export class ForecastUtility {
  /**
   * Creates a forecast for a given line of business (LOB) and asserts the response.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {Request} request - The request object.
   * @param {string} [forecastName=""] - The name of the forecast. If not provided, it will be generated.
   * @param {boolean} [isError=false] - Whether the request is expected to fail.
   * @return {Promise<number | string>} - The scenario ID of the created forecast or the error message.
   */
  static async createForecast(
    lobName,
    request,
    forecastName = "",
    isError = false
  ) {
    //Making the get call to create forecast
    Utility.logIt(`Creating Scenario for ${lobName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.createendpoint}`;
    Utility.logIt(endpointURL);
    // let PrimaryId = process.env.envName + "Primary";
    let payload = {
      type: commonData.type,
      // source: {
      //   scenarios: [
      //     {
      //       scenario_id: scenarioIds.payloads[PrimaryId].scenario_id,
      //     },
      //   ],
      // },
      name: lobName + " Automation - ",
      classification_id: commonData.classification_id,
      dim_id: commonData.lob_dim_id,
      dim_val_id: await UfmUtility.getMapping(lobName, "dim_val_id"),
    };

    payload.name =
      forecastName !== ""
        ? forecastName
        : payload.name + new Date().toLocaleString();
    const response = await request.post(
      endpointURL,

      { data: payload }
    );

    //asserting the response
    let responseBody = await Utility.assertAndLog(response, isError);

    if (!isError) {
      expect
        .soft(responseBody.message)
        .toEqual(forecastData.createSuccessMessage);
      Utility.logIt(
        `Forecast is created for ${lobName}  : 
      ${responseBody.scenario.scenario_id}`
      );

      //Polling to get the scenario status to accomodate async changes
      await expect
        .poll(
          async () => {
            const response = await UfmUtility.getCurrentForecastList(
              lobName,
              request
            );
            let new_scenario = response.find(
              (i) => i["scenarioId"] == responseBody.scenario.scenario_id
            );
            return new_scenario["forecastStatus"]["statusCode"];
          },
          {
            // Probe, wait 60s, probe, wait 60s, probe, wait 60s, probe, wait 30s, probe and so on..
            intervals: [
              20_000, 20_000, 20_000, 10_000, 10_000, 10_000, 30_000, 30_000,
            ],
            timeout: 500_000,
          }
        )
        .toBe(21);
    }

    //returning the scenario Id of the created forecast
    return responseBody.scenario?.scenario_id
      ? responseBody.scenario.scenario_id
      : responseBody.message;
  }

  /**
   * Deletes a forecast.
   *
   * @param {number} scenario_id - The ID of the scenario.
   * @param {number} scenario_version - The version of the scenario.
   * @param {number} dimId - The ID of the dimension.
   * @param {number} dimValId - The ID of the dimension value.
   * @param {Request} request - The request object.
   * @param {boolean} isError - Whether the request is expected to fail.
   * @returns {Promise<object>} - The response body.
   */
  static async deleteForecast(
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
    const response = await request.delete(endpointURL, { data: payload });
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

  /**
   * This method will delete all forecast for a particular LOB created by user based on user id and Lob passed
   *
   * @param {Request} request - the request object
   * @param {string} lobName - the name of the line of business
   * @param {string} userId - the id of the user
   * @returns {Promise<void>}
   */
  static async deleteAllforecastofUser(request, lobName, userId) {
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
        (i["forecastStatus"]["statusCode"] == commonData.Draft ||
          i["forecastStatus"]["statusCode"] == commonData.Change_Requested) &&
        i["lineOfBusiness"] == lobId
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
  /**
   * Edits the name of a forecast.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {Request} request - The request object.
   * @param {number} scenario_id - The ID of the scenario.
   * @param {number} scenario_version - The version of the scenario.
   * @param {string} scenarioName - The new name of the forecast.
   * @return {Promise<void>} A promise that resolves when the forecast name is edited.
   */
  static async editForecastName(
    lobName,
    request,
    scenario_id,
    scenario_version,
    scenarioName,
    isError = false
  ) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.editNameendpoint}`;
    const response = await request.put(endpointURL, {
      data: {
        dim_id: commonData.lob_dim_id,
        dim_val_id: await UfmUtility.getMapping(lobName, "dim_val_id"),
        forecast_name: scenarioName,
        scenario_id: scenario_id,
        scenario_ver_ts: scenario_version,
      },
    });
    let responseBody = await Utility.assertAndLog(response, isError);
    return responseBody.message;
  }

  /**
   * Retrieves the draft or change request forecast for a given line of business.
   *
   * @param {string} lob - The name of the line of business.
   * @param {Request} request - The request object.
   * @return {Promise<object>} A promise that resolves to the scenario details.
   */
  static async getDraftorChangeRequestforecast(lob, request) {
    const currentForecastList = await UfmUtility.getCurrentForecastList(
      lob,
      request
    );
    const dim_val_id = await UfmUtility.getMapping(lob, "dim_val_id");

    // Find the first forecast that matches the criteria
    const scenario_details = currentForecastList.find(
      (i) =>
        i["lineOfBusiness"] === dim_val_id &&
        (i["forecastStatus"]["statusCode"] === commonData.Draft ||
          i["forecastStatus"]["statusCode"] === commonData.Change_Requested)
    );

    Utility.logIt(scenario_details);
    return scenario_details;
  }

  /**
   * Retrieves the count of forecast scenarios for a given line of business of logged in user.
   *
   * @param {string} lob - The name of the line of business.
   * @param {Request} request - The request object.
   * @return {Promise<number>} A promise that resolves to the count of forecast scenarios.
   */
  static async countOfScenario(lob, user, request) {
    const currentForecastList = await UfmUtility.getCurrentForecastList(
      lob,
      request
    );
    const dim_val_id = await UfmUtility.getMapping(lob, "dim_val_id");
    const lobForecastlist = currentForecastList.filter(
      (i) => i["lineOfBusiness"] === dim_val_id && i["owner"] == user
    );
    return lobForecastlist.length;
  }

  /**
   * Retrieves or creates a forecast for a given line of business.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {Request} request - The request object.
   * @return {Promise<[object, boolean]>} A promise that resolves to an array containing the scenario details and a boolean indicating if a new forecast was created.
   */
  static async getOrCreateForecastIfNotExists(lobName, request) {
    let scenario_details,
      isNewForecast = false;

    scenario_details = await ForecastUtility.getDraftorChangeRequestforecast(
      lobName,
      request
    );

    if (scenario_details == 0 || scenario_details == undefined) {
      const scenarioId = await ForecastUtility.createForecast(lobName, request);
      isNewForecast = true;
      let currentForecast = await UfmUtility.getCurrentForecastList(
        lobName,
        request
      );

      scenario_details = await UfmUtility.getScenarioDetails(
        currentForecast,
        scenarioId
      );
    }
    return [scenario_details, isNewForecast];
  }
}
