import debug from "debug";
import forecastData from '../testdata/forecast-api.json'
import hisTestdatafile from '../testdata/historical-forecast.json';
import { test, expect } from '../../common/fixtures/test-hook';

export class UfmUtility {

  // This method will create the scenario and asserts the response
  static async createForecast(lobName, request) {

    //Making the get call to create forecast
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(
      endpointURL,

      { data: forecastData.createForecastPayloads[lobName] }
    );
    //asserting the response
    expect(response).toBeOK();
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(forecastData.createSuccessMessage)
    debug.log(JSON.stringify(responseBody));

    //returning the scenario Id of the created forecast
    return responseBody.scenario.scenario_id;
  }

  // This method will delete the sceanrio
static async deleteForecast(data, dimId, dimValId, request) {
  data = forecastData.scenario_id;
  const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}${data}`;
  const payload = {

      dim_id: dimId,
      dim_val_id: dimValId
    
  };
  const response = await request.delete(endpointURL, { data: payload });
  const responseBody = await response.json();
  debug.log(JSON.stringify(responseBody));
  return responseBody;
}

//This method will fetch historical forecast based on the particular forecast name
  static async GetHistorical(forecastname: string,request){
    let responseData, responseBody
    
    const historicalEndpointURL = `${process.env.apiBaseURLUFM}${hisTestdatafile.endpoint}`
    const body = hisTestdatafile.sba_datas.filter((forecast) => (forecast.forecastname=== forecastname));

      responseData = await request.get(historicalEndpointURL, {
          params: {
            ...body["queryParams"]
          }
      })
      responseBody = await responseData.json();
      return responseBody;
      ;
  };
  }