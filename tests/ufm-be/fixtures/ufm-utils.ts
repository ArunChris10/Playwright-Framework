import debug from "debug";
import forecastData from "../testdata/forecast-api.json";
import currentforecastData from "../testdata/getCurrrentForecast.json";
import filterData from "../testdata/filter-service.json";
import hisTestdatafile from "../testdata/historical-forecast.json";
import { expect } from "../../common/fixtures/test-hook";

export class UfmUtility {
  // This method will create the scenario and asserts the response
  static async createForecast(lobName, request) {
    //Making the get call to create forecast
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
    debug.log(endpointURL);
    forecastData.createForecastPayloads[lobName].name =
      forecastData.createForecastPayloads[lobName].name +
      new Date().toLocaleString();
    const response = await request.post(
      endpointURL,

      { data: forecastData.createForecastPayloads[lobName] }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(forecastData.createSuccessMessage);
    debug.log(JSON.stringify(responseBody));

    //returning the scenario Id of the created forecast
    return responseBody.scenario.scenario_id;
  }

  // This method will get all the current scenario and asserts the response
  static async getCurrentForecast(lobName, request) {
    //Making the get call to create forecast
    const endpointURL = `${process.env.apiBaseURLUFM}${currentforecastData.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(endpointURL, {
      data: currentforecastData.getCurrentForecastpayload[lobName],
    });

    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    debug.log(JSON.stringify(responseBody));

    //returning the current forecast list
    return responseBody.rowData;
  }

  static async createFilter(payload, request) {
    //Making the get call to create filter
    const endpointURL = `${process.env.apiBaseURLUFM}${filterData.endpoint}`;
    debug.log(endpointURL);

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

  // This method will delete the sceanrio
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
    expect(response).toBeOK();
    const responseBody = await response.json();
    console.log(JSON.stringify(responseBody));
    debug.log(JSON.stringify(responseBody));
    return responseBody;
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
}
